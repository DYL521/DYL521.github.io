document.addEventListener('DOMContentLoaded', (event) => {
    // 为所有代码块添加语言标识
    document.querySelectorAll('pre code').forEach((block) => {
        // 获取语言类
        const className = block.className;
        const lang = className.match(/language-([a-z]+)/)?.[1] || 'plaintext';
        
        // 设置父元素的语言标识
        block.parentElement.setAttribute('data-lang', lang);
        
        // 确保有正确的类名
        if (!className.includes('language-')) {
            block.className = `language-${lang}`;
        }
    });

    // 重新加载 Prism
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    } else {
        console.error('Prism is not loaded!');
    }
}); 