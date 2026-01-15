// 时间戳识别和转换工具
(function() {
  'use strict';

  let tooltipElement = null;

  // 创建提示框元素
  function createTooltip() {
    if (tooltipElement) return tooltipElement;
    
    const tooltip = document.createElement('div');
    tooltip.id = 'timestamp-tooltip';
    tooltip.className = 'timestamp-tooltip';
    document.body.appendChild(tooltip);
    tooltipElement = tooltip;
    return tooltip;
  }

  // 判断是否为有效的时间戳
  function isValidTimestamp(num) {
    // 毫秒级时间戳范围：1970-01-01 到 2100-12-31
    const minTimestamp = 0;
    const maxTimestamp = 4133980800000;
    
    if (num < minTimestamp || num > maxTimestamp) {
      return false;
    }
    
    return true;
  }

  // 将时间戳转换为可读格式
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return null;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    
    return {
      full: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`,
      iso: date.toISOString(),
      locale: date.toLocaleString('zh-CN', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    };
  }

  // 显示提示框
  function showTooltip(x, y, content) {
    const tooltip = createTooltip();
    tooltip.innerHTML = content;
    tooltip.style.display = 'block';
    
    // 计算位置，确保不超出视口
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = x + 10;
    let top = y + 10;
    
    // 如果超出右边界，显示在左边
    if (left + tooltipRect.width > viewportWidth) {
      left = x - tooltipRect.width - 10;
    }
    
    // 如果超出下边界，显示在上边
    if (top + tooltipRect.height > viewportHeight) {
      top = y - tooltipRect.height - 10;
    }
    
    tooltip.style.left = left + window.scrollX + 'px';
    tooltip.style.top = top + window.scrollY + 'px';
  }

  // 隐藏提示框
  function hideTooltip() {
    if (tooltipElement) {
      tooltipElement.style.display = 'none';
    }
  }

  // 获取选中的文本
  function getSelectedText() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    
    const text = selection.toString().trim();
    return text;
  }

  // 尝试从元素中提取时间戳
  function extractTimestampFromElement(element) {
    if (!element) return null;
    
    // 获取元素的文本内容
    let text = element.textContent || element.innerText || '';
    text = text.trim();
    
    // 如果文本太长，可能不是单独的时间戳
    if (text.length > 20) {
      return null;
    }
    
    // 清理文本，只保留数字
    const cleanText = text.replace(/\D/g, '');
    
    // 必须是恰好13位数字
    if (cleanText.length !== 13) {
      return null;
    }
    
    // 尝试匹配13位数字（毫秒时间戳）
    const timestampMatch = text.match(/\b(\d{13})\b/);
    if (timestampMatch) {
      return timestampMatch[1];
    }
    
    // 如果整个文本就是13位数字
    if (/^\d{13}$/.test(cleanText)) {
      return cleanText;
    }
    
    return null;
  }

  // 递归向上查找时间戳
  function findTimestampInHierarchy(element, maxDepth = 3) {
    let current = element;
    let depth = 0;
    
    while (current && depth < maxDepth) {
      const timestamp = extractTimestampFromElement(current);
      if (timestamp) {
        return timestamp;
      }
      
      // 同时检查所有子元素
      if (current.children && current.children.length > 0) {
        for (let child of current.children) {
          const childTimestamp = extractTimestampFromElement(child);
          if (childTimestamp) {
            return childTimestamp;
          }
        }
      }
      
      current = current.parentElement;
      depth++;
    }
    
    return null;
  }

  // 处理双击事件
  function handleDoubleClick(event) {
    // 如果点击的是提示框本身，不处理
    if (event.target.closest('#timestamp-tooltip')) {
      return;
    }
    
    let selectedText = getSelectedText();
    let fromSelection = false;
    
    // 首先检查选中的文本是否是有效的13位时间戳
    if (selectedText) {
      const cleanSelected = selectedText.trim().replace(/\D/g, '');
      if (/^\d{13}$/.test(cleanSelected)) {
        selectedText = cleanSelected;
        fromSelection = true;
      } else {
        selectedText = null;
      }
    }
    
    // 如果没有从选中文本获取到有效时间戳，尝试从点击的元素获取
    if (!selectedText) {
      const clickedElement = event.target;
      
      // 使用递归查找
      selectedText = findTimestampInHierarchy(clickedElement);
    }
    
    // 如果仍然没有找到，直接返回，不显示提示框
    if (!selectedText) {
      hideTooltip();
      return;
    }
    
    // 再次确认是13位数字
    if (selectedText.length !== 13 || !/^\d{13}$/.test(selectedText)) {
      hideTooltip();
      return;
    }
    
    // 尝试解析为数字
    const num = Number(selectedText);
    
    // 检查是否为有效数字
    if (isNaN(num) || !Number.isInteger(num)) {
      hideTooltip();
      return;
    }
    
    // 检查是否为有效的时间戳（在合理的时间范围内）
    if (!isValidTimestamp(num)) {
      hideTooltip();
      return;
    }
    
    // 格式化时间戳
    const formatted = formatTimestamp(num);
    
    // 如果格式化失败，不显示
    if (!formatted) {
      hideTooltip();
      return;
    }
    
    // 创建提示框内容
    const content = `
      <div class="timestamp-header">
        <strong>时间戳: ${num}</strong>
        <button class="close-btn" onclick="this.parentElement.parentElement.style.display='none'">×</button>
      </div>
      <div class="timestamp-content">
        <div class="timestamp-item">
          <span class="label">标准格式:</span>
          <span class="value" title="点击复制" data-copy="${formatted.full}">${formatted.full}</span>
        </div>
        <div class="timestamp-item">
          <span class="label">本地时间:</span>
          <span class="value" title="点击复制" data-copy="${formatted.locale}">${formatted.locale}</span>
        </div>
        <div class="timestamp-item">
          <span class="label">ISO 8601:</span>
          <span class="value" title="点击复制" data-copy="${formatted.iso}">${formatted.iso}</span>
        </div>
        <div class="timestamp-item">
          <span class="label">日期:</span>
          <span class="value" title="点击复制" data-copy="${formatted.date}">${formatted.date}</span>
        </div>
        <div class="timestamp-item">
          <span class="label">时间:</span>
          <span class="value" title="点击复制" data-copy="${formatted.time}">${formatted.time}</span>
        </div>
      </div>
    `;
    
    showTooltip(event.clientX, event.clientY, content);
  }

  // 复制到剪贴板
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // 显示复制成功提示
      showCopyNotification();
    }).catch(err => {
      console.error('复制失败:', err);
      // 降级方案
      fallbackCopyToClipboard(text);
    });
  }

  // 降级复制方案
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      showCopyNotification();
    } catch (err) {
      console.error('降级复制也失败了:', err);
    }
    
    document.body.removeChild(textArea);
  }

  // 显示复制成功通知
  function showCopyNotification() {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = '已复制到剪贴板！';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  // 点击复制功能
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('value') && event.target.hasAttribute('data-copy')) {
      const text = event.target.getAttribute('data-copy');
      copyToClipboard(text);
    }
  });

  // 点击其他区域隐藏提示框
  document.addEventListener('click', function(event) {
    if (!event.target.closest('#timestamp-tooltip')) {
      hideTooltip();
    }
  });

  // 监听双击事件 - 使用捕获阶段确保优先处理
  document.addEventListener('dblclick', handleDoubleClick, true);
  
  // 额外添加一个延迟处理，确保选择完成后再处理
  document.addEventListener('dblclick', function(event) {
    setTimeout(() => handleDoubleClick(event), 50);
  });
  
  console.log('时间戳识别工具已加载');
})();
