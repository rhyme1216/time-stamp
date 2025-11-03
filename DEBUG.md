# 快速调试指南

## 问题：表格中的时间戳 1758511800732 不生效

这个时间戳转换后是：**2025-10-23 03:36:40.732**

## 快速验证步骤

### 步骤 1：重新加载扩展

1. 打开浏览器，输入 `chrome://extensions/` 或 `edge://extensions/`
2. 找到"时间戳识别工具"
3. 点击刷新按钮 🔄
4. 确保扩展已启用

### 步骤 2：使用调试页面

打开 `debug-test.html` 文件，这个页面会：
- 自动监听双击事件
- 显示详细的调试信息
- 告诉你哪里出了问题

### 步骤 3：在真实页面的控制台中运行以下代码

在包含你的时间戳元素的页面上：

1. 按 `F12` 或 `Cmd + Option + I` 打开开发者工具
2. 切换到 Console（控制台）标签
3. 粘贴并运行以下代码：

```javascript
// 1. 检查扩展是否加载
console.log('=== 检查扩展加载状态 ===');
const tooltip = document.getElementById('timestamp-tooltip');
console.log('扩展提示框元素:', tooltip ? '已加载 ✓' : '未加载 ✗');

// 2. 查找你的时间戳元素
console.log('\n=== 查找时间戳元素 ===');
const elements = document.querySelectorAll('.dbsv5-table-cell div');
console.log('找到的元素数量:', elements.length);

elements.forEach((el, index) => {
  console.log(`元素 ${index + 1}:`);
  console.log('  文本内容:', el.textContent);
  console.log('  是否包含13位数字:', /\d{13}/.test(el.textContent));
  
  const match = el.textContent.match(/(\d{13})/);
  if (match) {
    console.log('  提取的时间戳:', match[1]);
    const date = new Date(Number(match[1]));
    console.log('  转换结果:', date.toLocaleString('zh-CN'));
  }
});

// 3. 测试双击功能
console.log('\n=== 测试双击功能 ===');
console.log('请双击时间戳，然后运行下面的代码：');
console.log('window.getSelection().toString()');

// 4. 手动触发识别（绕过双击）
console.log('\n=== 手动测试时间戳转换 ===');
function testTimestamp(ts) {
  const date = new Date(Number(ts));
  console.log('时间戳:', ts);
  console.log('转换结果:', date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }));
}

testTimestamp('1758511800732');
```

### 步骤 4：手动模拟扩展功能

如果扩展仍然不工作，可以在控制台中直接运行扩展代码测试：

```javascript
// 复制这段代码到控制台
(function() {
  // 查找时间戳
  function findTimestamp(element) {
    let text = element.textContent || '';
    text = text.trim();
    const match = text.match(/\b(\d{13})\b/);
    return match ? match[1] : null;
  }

  // 转换时间戳
  function convertTimestamp(ts) {
    const date = new Date(Number(ts));
    return {
      full: date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false
      }),
      iso: date.toISOString()
    };
  }

  // 添加双击监听
  document.addEventListener('dblclick', function(e) {
    console.log('双击事件触发！');
    console.log('点击的元素:', e.target);
    
    let current = e.target;
    let depth = 0;
    
    while (current && depth < 5) {
      const ts = findTimestamp(current);
      if (ts) {
        console.log('找到时间戳:', ts);
        const result = convertTimestamp(ts);
        console.log('转换结果:', result);
        alert(`时间戳: ${ts}\n转换结果: ${result.full}`);
        return;
      }
      current = current.parentElement;
      depth++;
    }
    
    console.log('未找到时间戳');
  }, true);

  console.log('✓ 手动监听已添加，请双击时间戳测试');
})();
```

## 常见问题及解决方案

### 问题 1：扩展未加载
**症状**: 控制台没有 "时间戳识别工具已加载" 消息  
**解决**: 
- 检查扩展是否启用
- 刷新扩展
- 刷新网页

### 问题 2：双击没有选中完整数字
**症状**: 双击只选中部分数字  
**解决**: 已在新版本中修复，会自动从元素中提取

### 问题 3：网站阻止了扩展
**症状**: 控制台有 CSP 错误  
**解决**: 某些网站的安全策略可能阻止扩展，这是浏览器限制

### 问题 4：与其他扩展冲突
**症状**: 其他扩展也监听双击事件  
**解决**: 尝试禁用其他扩展测试

## 验证时间戳

你的两个时间戳：

1. **1758511800732**
   - 日期时间: 2025-10-23 03:36:40.732
   - ISO: 2025-10-22T19:36:40.732Z
   - 有效: ✓

2. **1760514008027**
   - 日期时间: 2025-11-14 20:53:28.027
   - ISO: 2025-11-14T12:53:28.027Z
   - 有效: ✓

## 最后的终极方案

如果所有方法都不行，可以考虑：

1. **使用书签工具** - 将时间戳转换做成书签（bookmarklet）
2. **使用右键菜单** - 修改扩展添加右键菜单选项
3. **使用快捷键** - 添加键盘快捷键触发转换
4. **开发独立网页工具** - 做一个独立的时间戳转换页面

需要这些替代方案的话请告诉我！
