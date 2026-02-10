#!/bin/bash
# 智能合约安全指南网站部署脚本

set -e  # 遇到错误时退出

echo "🚀 开始部署智能合约安全指南网站"
echo "======================================"

# 检查必要工具
check_tools() {
    echo "🔍 检查必要工具..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git未安装，请先安装Git"
        exit 1
    fi
    
    if ! command -v ruby &> /dev/null; then
        echo "⚠️  Ruby未安装，但可以继续（GitHub Actions会处理构建）"
    fi
    
    echo "✅ 工具检查完成"
}

# 构建网站
build_site() {
    echo "🔨 构建网站..."
    
    if command -v bundle &> /dev/null && command -v jekyll &> /dev/null; then
        echo "安装Ruby依赖..."
        bundle install
        
        echo "构建Jekyll网站..."
        bundle exec jekyll build
        
        if [ -d "_site" ]; then
            echo "✅ 网站构建成功"
            echo "  生成文件数: $(find _site -type f | wc -l)"
            echo "  总大小: $(du -sh _site | cut -f1)"
        else
            echo "❌ 网站构建失败"
            exit 1
        fi
    else
        echo "⚠️  跳过本地构建（将在GitHub Actions中构建）"
    fi
}

# 初始化Git仓库
init_git() {
    echo "📦 初始化Git仓库..."
    
    if [ ! -d ".git" ]; then
        git init
        echo "✅ Git仓库初始化完成"
    else
        echo "✅ Git仓库已存在"
    fi
}

# 配置Git用户
setup_git_user() {
    echo "👤 配置Git用户..."
    
    # 尝试从环境变量获取，否则使用默认值
    GIT_USER_NAME=${GIT_USER_NAME:-"智能合约安全指南"}
    GIT_USER_EMAIL=${GIT_USER_EMAIL:-"contact@smart-contract-security.guide"}
    
    git config user.name "$GIT_USER_NAME"
    git config user.email "$GIT_USER_EMAIL"
    
    echo "✅ Git用户配置完成: $GIT_USER_NAME <$GIT_USER_EMAIL>"
}

# 添加远程仓库
setup_remote() {
    echo "🌐 配置远程仓库..."
    
    read -p "请输入GitHub用户名: " GITHUB_USERNAME
    read -p "请输入仓库名称 [smart-contract-security-guide]: " REPO_NAME
    REPO_NAME=${REPO_NAME:-"smart-contract-security-guide"}
    
    REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    
    # 检查是否已存在远程仓库
    if git remote | grep -q origin; then
        echo "✅ 远程仓库已配置: $(git remote get-url origin)"
        read -p "是否更新远程仓库URL? (y/N): " UPDATE_REMOTE
        if [[ $UPDATE_REMOTE =~ ^[Yy]$ ]]; then
            git remote set-url origin "$REMOTE_URL"
            echo "✅ 远程仓库URL已更新"
        fi
    else
        git remote add origin "$REMOTE_URL"
        echo "✅ 远程仓库已添加: $REMOTE_URL"
    fi
}

# 提交更改
commit_changes() {
    echo "💾 提交更改..."
    
    # 添加所有文件
    git add .
    
    # 检查是否有更改
    if git diff --cached --quiet; then
        echo "✅ 没有需要提交的更改"
        return
    fi
    
    # 提交消息
    COMMIT_MESSAGE=${1:-"更新网站内容 $(date '+%Y-%m-%d %H:%M:%S')"}
    
    git commit -m "$COMMIT_MESSAGE"
    echo "✅ 更改已提交: $COMMIT_MESSAGE"
}

# 推送到GitHub
push_to_github() {
    echo "📤 推送到GitHub..."
    
    # 设置分支
    CURRENT_BRANCH=$(git branch --show-current)
    if [ -z "$CURRENT_BRANCH" ]; then
        git branch -M main
        CURRENT_BRANCH="main"
    fi
    
    echo "当前分支: $CURRENT_BRANCH"
    
    # 推送
    echo "推送代码到 origin/$CURRENT_BRANCH..."
    git push -u origin "$CURRENT_BRANCH"
    
    echo "✅ 代码已推送到GitHub"
}

# 显示部署信息
show_deploy_info() {
    echo ""
    echo "🎉 部署完成！"
    echo "======================================"
    
    if [ -n "$GITHUB_USERNAME" ]; then
        echo "🌐 网站地址:"
        echo "   GitHub Pages: https://$GITHUB_USERNAME.github.io/$REPO_NAME"
        echo ""
        echo "🔧 后续步骤:"
        echo "   1. 访问仓库: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
        echo "   2. 进入 Settings → Pages"
        echo "   3. 确保 Source 设置为 'Deploy from a branch'"
        echo "   4. 选择分支: main, 文件夹: / (root)"
        echo "   5. 保存设置，等待部署完成（约1-2分钟）"
        echo "   6. 访问你的网站！"
    else
        echo "📝 手动部署步骤:"
        echo "   1. 创建GitHub仓库: smart-contract-security-guide"
        echo "   2. 推送代码: git push -u origin main"
        echo "   3. 启用GitHub Pages"
        echo "   4. 等待部署完成"
    fi
    
    echo ""
    echo "📊 网站统计:"
    if [ -d "_site" ]; then
        echo "   页面数量: $(find _site -name "*.html" | wc -l)"
        echo "   文章数量: $(find _posts -name "*.md" | wc -l)"
        echo "   资源文件: $(find assets -type f | wc -l)"
    fi
    
    echo ""
    echo "🚀 立即开始获客赚钱:"
    echo "   1. 分享网站链接给潜在客户"
    echo "   2. 通过网站接受审计服务咨询"
    echo "   3. 持续更新内容吸引流量"
    echo "   4. 监控网站访问和转化"
}

# 主函数
main() {
    echo "智能合约安全指南网站部署工具"
    echo "版本: 1.0.0"
    echo ""
    
    # 检查工具
    check_tools
    
    # 构建网站
    build_site
    
    # Git操作
    init_git
    setup_git_user
    
    # 询问是否配置远程仓库
    read -p "是否配置远程GitHub仓库? (Y/n): " CONFIGURE_REMOTE
    if [[ ! $CONFIGURE_REMOTE =~ ^[Nn]$ ]]; then
        setup_remote
    fi
    
    # 提交更改
    commit_changes "部署智能合约安全指南网站 - $(date '+%Y-%m-%d')"
    
    # 询问是否推送
    if git remote | grep -q origin; then
        read -p "是否推送到GitHub? (Y/n): " PUSH_TO_GITHUB
        if [[ ! $PUSH_TO_GITHUB =~ ^[Nn]$ ]]; then
            push_to_github
        fi
    fi
    
    # 显示部署信息
    show_deploy_info
    
    echo ""
    echo "✅ 部署流程完成！"
    echo "🕒 时间: $(date)"
}

# 运行主函数
main "$@"