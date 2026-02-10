// 智能合约安全指南网站 - 主JavaScript文件

document.addEventListener('DOMContentLoaded', function() {
  // 1. 联系表单处理
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }
  
  // 2. 服务卡片交互
  initServiceCards();
  
  // 3. 代码高亮增强
  enhanceCodeBlocks();
  
  // 4. 导航菜单响应式
  initResponsiveNav();
  
  // 5. 分析跟踪（如果配置了Google Analytics）
  initAnalytics();
});

// 联系表单处理
function handleContactForm(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const formValues = Object.fromEntries(formData.entries());
  
  // 简单验证
  if (!validateForm(formValues)) {
    return;
  }
  
  // 显示加载状态
  const submitBtn = form.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '发送中...';
  submitBtn.disabled = true;
  
  // 模拟表单提交（实际应该发送到服务器）
  setTimeout(() => {
    // 显示成功消息
    const successDiv = document.getElementById('form-success');
    if (successDiv) {
      successDiv.style.display = 'block';
      form.style.display = 'none';
    }
    
    // 记录表单数据（实际应该发送到后端）
    console.log('Form submitted:', formValues);
    
    // 重置按钮
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
    // 可选：发送到实际后端
    // sendToBackend(formValues);
    
  }, 1500);
}

// 表单验证
function validateForm(data) {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('请输入有效的姓名或项目名称');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('请输入有效的邮箱地址');
  }
  
  if (!data['project-type']) {
    errors.push('请选择项目类型');
  }
  
  if (!data['service-type']) {
    errors.push('请选择服务类型');
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push('请详细描述你的项目需求（至少10个字符）');
  }
  
  if (errors.length > 0) {
    alert('请修正以下错误：\n\n' + errors.join('\n'));
    return false;
  }
  
  return true;
}

// 邮箱验证
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 服务卡片交互
function initServiceCards() {
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    // 点击卡片选择服务
    card.addEventListener('click', function(e) {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
        return; // 不干扰链接和按钮点击
      }
      
      // 移除其他卡片的选中状态
      serviceCards.forEach(c => c.classList.remove('selected'));
      
      // 添加选中状态
      this.classList.add('selected');
      
      // 更新联系表单中的服务选择
      updateContactFormService(this);
    });
    
    // 悬停效果
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
      this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
      if (!this.classList.contains('selected')) {
        this.style.transform = '';
        this.style.boxShadow = '';
      }
    });
  });
}

// 更新联系表单服务选择
function updateContactFormService(card) {
  const serviceTitle = card.querySelector('.service-title').textContent;
  const serviceSelect = document.getElementById('service-type');
  
  if (serviceSelect) {
    // 根据卡片标题找到对应的选项
    const options = Array.from(serviceSelect.options);
    const matchingOption = options.find(option => 
      option.text.includes(serviceTitle.split(' ')[0]) // 简单匹配
    );
    
    if (matchingOption) {
      serviceSelect.value = matchingOption.value;
    }
  }
}

// 代码块增强
function enhanceCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(block => {
    // 添加复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-btn';
    copyButton.textContent = '复制';
    copyButton.title = '复制代码';
    
    copyButton.addEventListener('click', function() {
      const code = block.textContent;
      navigator.clipboard.writeText(code).then(() => {
        const originalText = this.textContent;
        this.textContent = '已复制!';
        this.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
          this.textContent = originalText;
          this.style.backgroundColor = '';
        }, 2000);
      }).catch(err => {
        console.error('复制失败:', err);
        this.textContent = '复制失败';
        this.style.backgroundColor = '#ef4444';
      });
    });
    
    // 将按钮添加到代码块容器
    const pre = block.parentElement;
    pre.style.position = 'relative';
    copyButton.style.position = 'absolute';
    copyButton.style.top = '8px';
    copyButton.style.right = '8px';
    copyButton.style.padding = '4px 8px';
    copyButton.style.fontSize = '12px';
    copyButton.style.background = '#3b82f6';
    copyButton.style.color = 'white';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '4px';
    copyButton.style.cursor = 'pointer';
    
    pre.appendChild(copyButton);
    
    // 添加语言标签（如果可以从类名中提取）
    const classNames = Array.from(block.classList);
    const languageClass = classNames.find(cls => cls.startsWith('language-'));
    if (languageClass) {
      const language = languageClass.replace('language-', '');
      const langLabel = document.createElement('div');
      langLabel.className = 'code-language';
      langLabel.textContent = language.toUpperCase();
      langLabel.style.position = 'absolute';
      langLabel.style.top = '8px';
      langLabel.style.left = '8px';
      langLabel.style.fontSize = '11px';
      langLabel.style.color = '#94a3b8';
      langLabel.style.fontFamily = 'monospace';
      
      pre.appendChild(langLabel);
    }
  });
}

// 响应式导航
function initResponsiveNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  
  // 创建移动端菜单按钮
  const menuButton = document.createElement('button');
  menuButton.className = 'mobile-menu-btn';
  menuButton.innerHTML = '☰';
  menuButton.style.display = 'none';
  menuButton.style.background = 'none';
  menuButton.style.border = 'none';
  menuButton.style.fontSize = '24px';
  menuButton.style.cursor = 'pointer';
  menuButton.style.color = 'var(--primary-color)';
  
  // 插入到导航前面
  nav.parentElement.insertBefore(menuButton, nav);
  
  // 切换菜单显示
  menuButton.addEventListener('click', function() {
    nav.classList.toggle('mobile-show');
    this.innerHTML = nav.classList.contains('mobile-show') ? '✕' : '☰';
  });
  
  // 响应式显示/隐藏
  function checkMobile() {
    if (window.innerWidth <= 768) {
      menuButton.style.display = 'block';
      nav.classList.add('mobile-nav');
      if (!nav.classList.contains('mobile-show')) {
        nav.style.display = 'none';
      }
    } else {
      menuButton.style.display = 'none';
      nav.classList.remove('mobile-nav', 'mobile-show');
      nav.style.display = '';
    }
  }
  
  // 初始检查和窗口调整
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  // 点击菜单项后关闭移动菜单
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        nav.classList.remove('mobile-show');
        menuButton.innerHTML = '☰';
      }
    });
  });
}

// 分析跟踪
function initAnalytics() {
  // 这里可以添加Google Analytics或其他分析工具
  // 示例：Google Analytics 4
  /*
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
  */
  
  // 简单的页面访问跟踪
  console.log('页面访问:', {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString()
  });
  
  // 服务点击跟踪
  document.querySelectorAll('.service-button, .submit-btn').forEach(button => {
    button.addEventListener('click', function() {
      console.log('服务点击:', {
        buttonText: this.textContent,
        page: document.title,
        time: new Date().toISOString()
      });
    });
  });
}

// 工具函数：格式化SOL金额
function formatSOL(amount) {
  return `${amount} SOL`;
}

// 工具函数：获取当前年份（用于版权信息）
function getCurrentYear() {
  return new Date().getFullYear();
}

// 自动更新版权年份
function updateCopyrightYear() {
  const copyrightElements = document.querySelectorAll('.copyright-year');
  const currentYear = getCurrentYear();
  
  copyrightElements.forEach(element => {
    if (element.textContent.includes('2026') && currentYear > 2026) {
      element.textContent = element.textContent.replace('2026', `2026-${currentYear}`);
    }
  });
}

// 页面加载完成后的初始化
window.addEventListener('load', function() {
  updateCopyrightYear();
  
  // 添加页面加载动画
  document.body.classList.add('loaded');
  
  // 延迟加载图片（如果有的话）
  lazyLoadImages();
});

// 图片懒加载
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// 导出函数供其他脚本使用（如果需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateForm,
    isValidEmail,
    formatSOL,
    getCurrentYear
  };
}