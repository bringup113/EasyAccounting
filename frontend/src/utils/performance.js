/**
 * 性能监控工具
 * 用于监控应用性能并记录关键指标
 */

// 初始化性能监控
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined' && window.performance) {
    // 监听导航计时
    if (window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const navigationStart = timing.navigationStart;
          
          // 计算关键性能指标
          const metrics = {
            // DNS查询时间
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            // TCP连接时间
            tcp: timing.connectEnd - timing.connectStart,
            // 请求响应时间
            request: timing.responseEnd - timing.requestStart,
            // DOM解析时间
            dom: timing.domComplete - timing.domLoading,
            // 页面加载总时间
            load: timing.loadEventEnd - navigationStart,
            // 首次内容绘制时间
            firstPaint: getFirstPaintTime() - navigationStart,
          };
          
          // 记录性能指标
          logPerformanceMetrics(metrics);
        }, 0);
      });
    }
    
    // 监听资源加载
    if (window.performance.getEntriesByType) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const resources = window.performance.getEntriesByType('resource');
          
          // 分析资源加载情况
          analyzeResourceLoading(resources);
        }, 0);
      });
    }
  }
};

// 获取首次绘制时间
const getFirstPaintTime = () => {
  if (window.performance.getEntriesByType) {
    const paintMetrics = window.performance.getEntriesByType('paint');
    const firstPaint = paintMetrics.find(entry => entry.name === 'first-paint');
    
    if (firstPaint) {
      return firstPaint.startTime;
    }
  }
  
  return window.performance.timing.domLoading;
};

// 记录性能指标
const logPerformanceMetrics = (metrics) => {
  console.log('性能指标:', metrics);
  
  // 检测性能问题
  detectPerformanceIssues(metrics);
  
  // 这里可以添加将指标发送到分析服务的代码
  // sendMetricsToAnalyticsService(metrics);
};

// 分析资源加载情况
const analyzeResourceLoading = (resources) => {
  if (!resources || resources.length === 0) return;
  
  // 按资源类型分组
  const resourcesByType = resources.reduce((acc, resource) => {
    const type = getResourceType(resource.name);
    if (!acc[type]) acc[type] = [];
    acc[type].push({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
    });
    return acc;
  }, {});
  
  // 计算每种资源类型的统计信息
  const stats = {};
  Object.keys(resourcesByType).forEach(type => {
    const items = resourcesByType[type];
    stats[type] = {
      count: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      totalTime: items.reduce((sum, item) => sum + item.duration, 0),
      avgTime: items.reduce((sum, item) => sum + item.duration, 0) / items.length,
      slowest: items.sort((a, b) => b.duration - a.duration)[0],
    };
  });
  
  console.log('资源加载统计:', stats);
  
  // 检测资源加载问题
  detectResourceIssues(stats);
};

// 获取资源类型
const getResourceType = (url) => {
  if (!url) return 'other';
  
  if (url.endsWith('.js')) return 'script';
  if (url.endsWith('.css')) return 'style';
  if (/\.(png|jpg|jpeg|gif|svg|webp)/.test(url)) return 'image';
  if (/\.(woff|woff2|ttf|eot)/.test(url)) return 'font';
  if (/\.(json)/.test(url)) return 'json';
  
  return 'other';
};

// 检测性能问题
const detectPerformanceIssues = (metrics) => {
  const issues = [];
  
  // 页面加载时间过长
  if (metrics.load > 3000) {
    issues.push({
      type: 'warning',
      message: `页面加载时间过长: ${Math.round(metrics.load)}ms`,
    });
  }
  
  // DOM解析时间过长
  if (metrics.dom > 1000) {
    issues.push({
      type: 'warning',
      message: `DOM解析时间过长: ${Math.round(metrics.dom)}ms`,
    });
  }
  
  // 请求响应时间过长
  if (metrics.request > 1000) {
    issues.push({
      type: 'warning',
      message: `API响应时间过长: ${Math.round(metrics.request)}ms`,
    });
  }
  
  // 记录检测到的问题
  if (issues.length > 0) {
    console.warn('检测到性能问题:', issues);
  }
};

// 检测资源加载问题
const detectResourceIssues = (stats) => {
  const issues = [];
  
  // 检查大图片
  if (stats.image && stats.image.totalSize > 1000000) {
    issues.push({
      type: 'warning',
      message: `图片资源过大: ${Math.round(stats.image.totalSize / 1024)}KB`,
    });
  }
  
  // 检查脚本加载时间
  if (stats.script && stats.script.avgTime > 500) {
    issues.push({
      type: 'warning',
      message: `脚本加载时间过长: 平均${Math.round(stats.script.avgTime)}ms`,
      detail: `最慢的脚本: ${stats.script.slowest.name} (${Math.round(stats.script.slowest.duration)}ms)`,
    });
  }
  
  // 记录检测到的问题
  if (issues.length > 0) {
    console.warn('检测到资源加载问题:', issues);
  }
};

// 组件渲染性能监控
export const measureComponentRender = (componentName, callback) => {
  if (process.env.NODE_ENV !== 'production') {
    const startTime = performance.now();
    
    // 执行回调函数
    callback();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // 记录组件渲染时间
    console.log(`组件 ${componentName} 渲染耗时: ${duration.toFixed(2)}ms`);
    
    // 检测渲染性能问题
    if (duration > 50) {
      console.warn(`组件 ${componentName} 渲染时间过长: ${duration.toFixed(2)}ms`);
    }
  } else {
    // 生产环境直接执行回调
    callback();
  }
}; 