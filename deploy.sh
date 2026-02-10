#!/bin/bash
# 智能合约安全博客部署脚本

echo "🚀 开始部署智能合约安全博客到GitHub Pages"
echo "=========================================="

# 检查必要工具
check_tools() {
    echo "🔧 检查必要工具..."
    
    # 检查git
    if ! command -v git &> /dev/null; then
        echo "❌ Git未安装，请先安装Git"
        exit 1
    fi
    echo "✅ Git已安装"
    
    # 检查ruby和bundler
    if ! command -v ruby &> /dev/null; then
        echo "⚠️ Ruby未安装，将使用GitHub Actions构建"
    else
        echo "✅ Ruby已安装"
        
        if ! command -v bundler &> /dev/null; then
            echo "📦 安装Bundler..."
            gem install bundler
        fi
        echo "✅ Bundler已安装"
    fi
}

# 创建GitHub仓库
setup_github() {
    echo ""
    echo "🌐 设置GitHub仓库..."
    
    # 检查是否在Git仓库中
    if [ ! -d ".git" ]; then
        echo "📁 初始化Git仓库..."
        git init
    fi
    
    # 添加远程仓库（如果不存在）
    if ! git remote | grep -q origin; then
        echo "请输入GitHub仓库URL（例如：https://github.com/用户名/smart-contract-security-blog.git）："
        read -r repo_url
        
        if [ -n "$repo_url" ]; then
            git remote add origin "$repo_url"
            echo "✅ 添加远程仓库: $repo_url"
        else
            echo "⚠️ 未提供仓库URL，将只创建本地仓库"
        fi
    else
        echo "✅ 远程仓库已配置"
    fi
}

# 安装依赖
install_dependencies() {
    echo ""
    echo "📦 安装依赖..."
    
    if [ -f "Gemfile" ]; then
        if command -v bundler &> /dev/null; then
            echo "安装Ruby依赖..."
            bundle install
            echo "✅ 依赖安装完成"
        else
            echo "⚠️ Bundler未安装，跳过Ruby依赖安装"
        fi
    else
        echo "⚠️ 未找到Gemfile，跳过依赖安装"
    fi
}

# 构建网站
build_site() {
    echo ""
    echo "🔨 构建网站..."
    
    # 清理旧构建
    if [ -d "_site" ]; then
        echo "清理旧构建..."
        rm -rf _site
    fi
    
    # 构建网站
    if command -v jekyll &> /dev/null; then
        echo "使用Jekyll构建..."
        jekyll build
    elif command -v bundle &> /dev/null; then
        echo "使用Bundler构建..."
        bundle exec jekyll build
    else
        echo "⚠️ 未找到Jekyll，将只提交源代码"
    fi
    
    if [ -d "_site" ]; then
        echo "✅ 网站构建完成，大小: $(du -sh _site | cut -f1)"
    else
        echo "⚠️ 未生成_site目录，将只提交源代码"
    fi
}

# 配置GitHub Pages
setup_github_pages() {
    echo ""
    echo "⚙️ 配置GitHub Pages..."
    
    # 创建CNAME文件（如果需要自定义域名）
    if [ ! -f "CNAME" ]; then
        echo "是否需要自定义域名？(y/n): "
        read -r use_custom_domain
        
        if [ "$use_custom_domain" = "y" ] || [ "$use_custom_domain" = "Y" ]; then
            echo "请输入域名（例如：security.yourdomain.com）："
            read -r domain
            
            if [ -n "$domain" ]; then
                echo "$domain" > CNAME
                echo "✅ 创建CNAME文件: $domain"
            fi
        fi
    fi
    
    # 创建.nojekyll文件（如果使用自定义构建）
    if [ ! -f ".nojekyll" ]; then
        touch .nojekyll
        echo "✅ 创建.nojekyll文件"
    fi
    
    # 创建GitHub Actions工作流
    if [ ! -d ".github/workflows" ]; then
        mkdir -p .github/workflows
    fi
    
    cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
          bundler-cache: true
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Build with Jekyll
        run: |
          bundle install
          bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
        env:
          JEKYLL_ENV: production
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./_site

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF
    
    echo "✅ 创建GitHub Actions部署工作流"
}

# 提交和推送
commit_and_push() {
    echo ""
    echo "📤 提交更改..."
    
    # 添加所有文件
    git add .
    
    # 提交
    commit_message="更新网站内容 - $(date '+%Y年%m月%d日 %H:%M:%S')"
    git commit -m "$commit_message"
    
    echo "✅ 提交完成: $commit_message"
    
    # 推送到远程仓库
    if git remote | grep -q origin; then
        echo ""
        echo "推送更改到GitHub..."
        
        # 设置上游分支
        git branch -M main
        
        # 推送
        git push -u origin main
        
        echo "✅ 推送完成"
        echo ""
        echo "🌐 网站将在几分钟后可通过以下地址访问："
        echo "   https://<你的用户名>.github.io/smart-contract-security-blog"
        echo ""
        echo "或者如果你配置了自定义域名："
        if [ -f "CNAME" ]; then
            echo "   https://$(cat CNAME)"
        fi
    else
        echo "⚠️ 未配置远程仓库，更改只保存在本地"
        echo "要部署到GitHub Pages，请："
        echo "1. 在GitHub创建新仓库"
        echo "2. 运行: git remote add origin <仓库URL>"
        echo "3. 重新运行此脚本"
    fi
}

# 显示部署说明
show_instructions() {
    echo ""
    echo "📋 部署完成！"
    echo "============="
    echo ""
    echo "🎯 下一步操作："
    echo ""
    echo "1. 访问GitHub仓库设置："
    echo "   - 转到 Settings > Pages"
    echo "   - 选择 'Deploy from a branch'"
    echo "   - 分支选择 'main'，文件夹选择 '/ (root)'"
    echo "   - 点击 Save"
    echo ""
    echo "2. 等待部署完成（约2-5分钟）"
    echo ""
    echo "3. 访问你的网站："
    if git remote get-url origin &> /dev/null; then
        repo_name=$(basename -s .git "$(git remote get-url origin)")
        user_name=$(echo "$(git remote get-url origin)" | sed -n 's/.*github.com[:/]\([^/]*\).*/\1/p')
        echo "   https://$user_name.github.io/$repo_name"
    else
        echo "   https://<用户名>.github.io/<仓库名>"
    fi
    echo ""
    echo "4. 搜索引擎优化："
    echo "   - 提交到Google Search Console"
    echo "   - 提交到Bing Webmaster Tools"
    echo "   - 分享到社交媒体"
    echo ""
    echo "5. 监控流量："
    echo "   - 添加Google Analytics"
    echo "   - 设置转化跟踪"
    echo ""
    echo "💡 提示："
    echo "- 网站内容在 /root/.openclaw/workspace/blog 目录"
    echo "- 可以随时修改内容并重新运行此脚本部署"
    echo "- 新文章放在 _posts/ 目录，按 YYYY-MM-DD-title.md 格式命名"
}

# 主函数
main() {
    echo "智能合约安全博客部署工具"
    echo "版本: 1.0.0"
    echo ""
    
    # 进入博客目录
    cd "$(dirname "$0")" || exit 1
    
    # 执行部署步骤
    check_tools
    setup_github
    install_dependencies
    build_site
    setup_github_pages
    commit_and_push
    show_instructions
}

# 执行主函数
main "$@"