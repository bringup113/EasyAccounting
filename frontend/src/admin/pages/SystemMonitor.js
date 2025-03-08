import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Button, Space, Tag, Divider, message, Modal, Tooltip } from 'antd';
import { 
  ReloadOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ApiOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const SystemMonitor = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [systemStatus, setSystemStatus] = useState({
    cpu: 35,
    memory: 65,
    disk: 48,
    uptime: '15天4小时',
    services: []
  });
  
  // 模拟获取系统状态
  const fetchSystemStatus = () => {
    setLoading(true);
    // 这里应该是实际的API调用
    setTimeout(() => {
      // 创建一个模拟的缓存服务器状态
      const cacheServer = {
        id: 4,
        name: '缓存服务器',
        status: 'warning', // 默认为警告状态
        uptime: '2天6小时',
        load: 78,
        type: 'cache'
      };
      
      // 检查是否有缓存服务器的状态更新
      const existingCacheServer = systemStatus.services.find(s => s.type === 'cache');
      if (existingCacheServer) {
        // 如果已经存在缓存服务器，保留其当前状态
        cacheServer.status = existingCacheServer.status;
        cacheServer.uptime = existingCacheServer.uptime;
        
        // 检查是否是刚刚优化过的缓存服务器
        if (existingCacheServer.status === 'running' && existingCacheServer.uptime === '刚刚优化') {
          // 检查是否已修复内存泄漏
          if (existingCacheServer.memoryLeakFixed) {
            // 如果已修复内存泄漏，负载保持稳定或略微增加
            const currentLoad = existingCacheServer.load;
            const newLoad = Math.min(currentLoad + 2, 60); // 每次最多增加2%，最高到60%
            cacheServer.load = newLoad;
            cacheServer.memoryLeakFixed = true; // 保留修复标记
          } else {
            // 未修复内存泄漏，模拟负载持续增高的问题
            const currentLoad = existingCacheServer.load;
            const newLoad = Math.min(currentLoad + 15, 95); // 每次增加15%，最高到95%
            
            // 如果负载超过75%，状态变为警告
            if (newLoad > 75) {
              cacheServer.status = 'warning';
              cacheServer.load = newLoad;
            } else {
              cacheServer.load = newLoad;
            }
          }
        } else {
          cacheServer.load = existingCacheServer.load;
          // 保留内存泄漏修复标记（如果有）
          if (existingCacheServer.memoryLeakFixed) {
            cacheServer.memoryLeakFixed = true;
          }
        }
      }
      
      setSystemStatus({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        uptime: '15天4小时',
        services: [
          {
            id: 1,
            name: 'Web服务器',
            status: 'running',
            uptime: '15天4小时',
            load: 35,
            type: 'web'
          },
          {
            id: 2,
            name: 'API服务器',
            status: 'running',
            uptime: '15天4小时',
            load: 42,
            type: 'api'
          },
          {
            id: 3,
            name: '数据库',
            status: 'running',
            uptime: '15天3小时',
            load: 28,
            type: 'database'
          },
          cacheServer, // 使用更新后的缓存服务器状态
          {
            id: 5,
            name: '备份服务',
            status: 'stopped',
            uptime: '-',
            load: 0,
            type: 'backup'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  };
  
  useEffect(() => {
    fetchSystemStatus();
    
    // 设置定时刷新
    const intervalId = setInterval(() => {
      fetchSystemStatus();
    }, 30000); // 每30秒刷新一次
    
    return () => clearInterval(intervalId);
  }, []);
  
  // 获取服务图标
  const getServiceIcon = (type) => {
    switch (type) {
      case 'web':
        return <DesktopOutlined />;
      case 'api':
        return <ApiOutlined />;
      case 'database':
        return <DatabaseOutlined />;
      case 'cache':
      case 'backup':
      default:
        return <CloudServerOutlined />;
    }
  };
  
  // 启动服务
  const handleStartService = (service) => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'admin.monitor.startConfirm', defaultMessage: '启动服务' }),
      content: intl.formatMessage(
        { id: 'admin.monitor.startConfirmContent', defaultMessage: '确定要启动 {name} 服务吗？' },
        { name: service.name }
      ),
      icon: <QuestionCircleOutlined />,
      onOk() {
        return new Promise((resolve, reject) => {
          // 设置对应服务的加载状态
          setActionLoading(prev => ({ ...prev, [service.id]: true }));
          
          // 模拟API调用
          setTimeout(() => {
            // 缓存服务器特殊处理 - 模拟启动失败
            if (service.type === 'cache') {
              // 清除加载状态
              setActionLoading(prev => ({ ...prev, [service.id]: false }));
              
              // 显示错误消息
              message.error(intl.formatMessage(
                { id: 'admin.monitor.startError', defaultMessage: '{name} 服务启动失败: 连接超时' },
                { name: service.name }
              ));
              
              // 显示详细错误对话框
              Modal.error({
                title: intl.formatMessage(
                  { id: 'admin.monitor.startErrorTitle', defaultMessage: '{name} 启动失败' },
                  { name: service.name }
                ),
                content: (
                  <div>
                    <p>{intl.formatMessage({ id: 'admin.monitor.cacheStartError', defaultMessage: '缓存服务器启动失败，可能的原因:' })}</p>
                    <ul>
                      <li>{intl.formatMessage({ id: 'admin.monitor.cacheStartErrorReason1', defaultMessage: '内存资源不足' })}</li>
                      <li>{intl.formatMessage({ id: 'admin.monitor.cacheStartErrorReason2', defaultMessage: '端口 6379 已被占用' })}</li>
                      <li>{intl.formatMessage({ id: 'admin.monitor.cacheStartErrorReason3', defaultMessage: '配置文件错误' })}</li>
                    </ul>
                    <p>{intl.formatMessage({ id: 'admin.monitor.checkLogs', defaultMessage: '请检查系统日志获取详细信息。' })}</p>
                    <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {`ErrorResponse: 未授权访问
    at /Users/brucelin/Desktop/记账软件/backend/src/middleware/auth.js:24:17
    at /Users/brucelin/Desktop/记账软件/backend/src/middlewares/async.js:4:19
    at Layer.handle [as handle_request] (/Users/brucelin/Desktop/记账软件/backend/node_modules/express/lib/router/layer.js:95:5)
    at trim_prefix (/Users/brucelin/Desktop/记账软件/backend/node_modules/express/lib/router/index.js:328:13)
    statusCode: 401`}
                      </pre>
                    </div>
                  </div>
                ),
                okText: intl.formatMessage({ id: 'admin.monitor.viewLogs', defaultMessage: '查看日志' }),
                onOk() {
                  message.info(intl.formatMessage({ id: 'admin.monitor.redirectingToLogs', defaultMessage: '正在跳转到日志页面...' }));
                  // 这里可以添加跳转到日志页面的逻辑
                }
              });
              
              resolve();
              return;
            }
            
            // 其他服务正常处理
            try {
              // 更新服务状态
              const updatedServices = systemStatus.services.map(item => {
                if (item.id === service.id) {
                  return { ...item, status: 'running', uptime: '刚刚启动' };
                }
                return item;
              });
              
              setSystemStatus(prev => ({
                ...prev,
                services: updatedServices
              }));
              
              // 显示成功消息
              message.success(intl.formatMessage(
                { id: 'admin.monitor.startSuccess', defaultMessage: '{name} 服务已成功启动' },
                { name: service.name }
              ));
              
              resolve();
            } catch (error) {
              // 显示通用错误消息
              message.error(intl.formatMessage(
                { id: 'admin.monitor.operationError', defaultMessage: '操作失败: {error}' },
                { error: error.message || '未知错误' }
              ));
              reject(error);
            } finally {
              // 清除加载状态
              setActionLoading(prev => ({ ...prev, [service.id]: false }));
            }
          }, 1500);
        });
      }
    });
  };
  
  // 停止服务
  const handleStopService = (service) => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'admin.monitor.stopConfirm', defaultMessage: '停止服务' }),
      content: intl.formatMessage(
        { id: 'admin.monitor.stopConfirmContent', defaultMessage: '确定要停止 {name} 服务吗？这可能会影响系统功能。' },
        { name: service.name }
      ),
      icon: <ExclamationCircleOutlined />,
      okType: 'danger',
      onOk() {
        return new Promise((resolve, reject) => {
          // 设置对应服务的加载状态
          setActionLoading(prev => ({ ...prev, [service.id]: true }));
          
          // 模拟API调用
          setTimeout(() => {
            try {
              // 更新服务状态 - 无论是什么服务，停止后状态都应该是stopped
              const updatedServices = systemStatus.services.map(item => {
                if (item.id === service.id) {
                  return { ...item, status: 'stopped', uptime: '-', load: 0 };
                }
                return item;
              });
              
              setSystemStatus(prev => ({
                ...prev,
                services: updatedServices
              }));
              
              // 显示成功消息
              message.success(intl.formatMessage(
                { id: 'admin.monitor.stopSuccess', defaultMessage: '{name} 服务已成功停止' },
                { name: service.name }
              ));
              
              resolve();
            } catch (error) {
              // 显示通用错误消息
              message.error(intl.formatMessage(
                { id: 'admin.monitor.operationError', defaultMessage: '操作失败: {error}' },
                { error: error.message || '未知错误' }
              ));
              reject(error);
            } finally {
              // 清除加载状态
              setActionLoading(prev => ({ ...prev, [service.id]: false }));
            }
          }, 1500);
        });
      }
    });
  };
  
  // 重启服务
  const handleRestartService = (service) => {
    // 如果是缓存服务器且状态为警告，提供直接修复选项
    if (service.type === 'cache' && service.status === 'warning') {
      Modal.confirm({
        title: intl.formatMessage({ id: 'admin.monitor.fixCacheConfirm', defaultMessage: '修复缓存服务器' }),
        content: intl.formatMessage(
          { id: 'admin.monitor.fixCacheConfirmContent', defaultMessage: '检测到缓存服务器存在性能问题，是否直接进行优化修复？' }
        ),
        icon: <QuestionCircleOutlined />,
        okText: intl.formatMessage({ id: 'admin.monitor.fixNow', defaultMessage: '立即修复' }),
        cancelText: intl.formatMessage({ id: 'admin.monitor.justRestart', defaultMessage: '仅重启' }),
        onOk() {
          handleOptimizeCache();
        },
        onCancel() {
          // 用户选择仅重启，执行普通重启流程
          performRestartService(service);
        }
      });
      return;
    }
    
    // 其他服务或缓存服务器非警告状态，执行普通重启
    performRestartService(service);
  };
  
  // 执行重启服务操作
  const performRestartService = (service) => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'admin.monitor.restartConfirm', defaultMessage: '重启服务' }),
      content: intl.formatMessage(
        { id: 'admin.monitor.restartConfirmContent', defaultMessage: '确定要重启 {name} 服务吗？服务将暂时不可用。' },
        { name: service.name }
      ),
      icon: <QuestionCircleOutlined />,
      onOk() {
        return new Promise((resolve, reject) => {
          // 设置对应服务的加载状态
          setActionLoading(prev => ({ ...prev, [service.id]: true }));
          
          // 模拟API调用
          setTimeout(() => {
            try {
              // 缓存服务器特殊处理 - 模拟重启部分成功
              if (service.type === 'cache') {
                // 更新服务状态为警告状态
                const updatedServices = systemStatus.services.map(item => {
                  if (item.id === service.id) {
                    return { 
                      ...item, 
                      status: 'warning', 
                      uptime: '刚刚重启',
                      load: 85 // 高负载
                    };
                  }
                  return item;
                });
                
                setSystemStatus(prev => ({
                  ...prev,
                  services: updatedServices
                }));
                
                // 显示警告消息
                message.warning(intl.formatMessage(
                  { id: 'admin.monitor.restartWarning', defaultMessage: '{name} 服务已重启，但存在性能问题' },
                  { name: service.name }
                ));
                
                // 显示详细警告对话框
                Modal.warning({
                  title: intl.formatMessage(
                    { id: 'admin.monitor.restartWarningTitle', defaultMessage: '{name} 重启后存在问题' },
                    { name: service.name }
                  ),
                  content: (
                    <div>
                      <p>{intl.formatMessage({ id: 'admin.monitor.cacheRestartWarning', defaultMessage: '缓存服务器已重启，但检测到以下问题:' })}</p>
                      <ul>
                        <li>{intl.formatMessage({ id: 'admin.monitor.cacheHighLoad', defaultMessage: '服务器负载异常高 (85%)' })}</li>
                        <li>{intl.formatMessage({ id: 'admin.monitor.cacheMemoryLeak', defaultMessage: '可能存在内存泄漏' })}</li>
                        <li>{intl.formatMessage({ id: 'admin.monitor.cacheConnections', defaultMessage: '连接数超过正常值' })}</li>
                      </ul>
                      <p>{intl.formatMessage({ id: 'admin.monitor.performanceImpact', defaultMessage: '这可能会影响系统性能，建议检查配置或联系技术支持。' })}</p>
                      <div style={{ backgroundColor: '#fffbe6', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {`WARNING: Memory usage exceeds 80% threshold
WARN [RedisClient] - Too many connections (current: 245, max: 300)
WARN [CacheManager] - Cache hit ratio dropped to 65%`}
                        </pre>
                      </div>
                    </div>
                  ),
                  okText: intl.formatMessage({ id: 'admin.monitor.optimizeCache', defaultMessage: '优化缓存' }),
                  onOk() {
                    handleOptimizeCache();
                  }
                });
                
                resolve();
                return;
              }
              
              // 其他服务正常处理
              const updatedServices = systemStatus.services.map(item => {
                if (item.id === service.id) {
                  return { 
                    ...item, 
                    status: 'running', 
                    uptime: '刚刚重启',
                    load: Math.floor(Math.random() * 30) // 重启后负载通常较低
                  };
                }
                return item;
              });
              
              setSystemStatus(prev => ({
                ...prev,
                services: updatedServices
              }));
              
              // 显示成功消息
              message.success(intl.formatMessage(
                { id: 'admin.monitor.restartSuccess', defaultMessage: '{name} 服务已成功重启' },
                { name: service.name }
              ));
              
              resolve();
            } catch (error) {
              // 显示通用错误消息
              message.error(intl.formatMessage(
                { id: 'admin.monitor.operationError', defaultMessage: '操作失败: {error}' },
                { error: error.message || '未知错误' }
              ));
              reject(error);
            } finally {
              // 清除加载状态
              setActionLoading(prev => ({ ...prev, [service.id]: false }));
            }
          }, 2000);
        });
      }
    });
  };
  
  // 优化缓存服务器
  const handleOptimizeCache = () => {
    // 获取当前缓存服务器
    const cacheServer = systemStatus.services.find(s => s.type === 'cache');
    
    // 检查是否存在内存泄漏问题
    const hasMemoryLeak = cacheServer && cacheServer.load > 75;
    
    // 显示优化进度对话框
    const modal = Modal.info({
      title: intl.formatMessage({ id: 'admin.monitor.optimizingCache', defaultMessage: '正在优化缓存服务器' }),
      content: (
        <div>
          <p>{intl.formatMessage({ id: 'admin.monitor.optimizingCacheDesc', defaultMessage: '正在执行以下优化操作:' })}</p>
          <ul id="optimization-steps">
            <li>{intl.formatMessage({ id: 'admin.monitor.optimizingStep1', defaultMessage: '清理过期连接...' })}</li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <Progress percent={10} status="active" />
          </div>
        </div>
      ),
      icon: <SyncOutlined spin />,
      maskClosable: false,
      okButtonProps: { disabled: true, style: { display: 'none' } }
    });

    // 模拟优化过程
    setTimeout(() => {
      document.getElementById('optimization-steps').innerHTML += `
        <li>${intl.formatMessage({ id: 'admin.monitor.optimizingStep2', defaultMessage: '回收内存资源...' })}</li>
      `;
      modal.update({
        content: (
          <div>
            <p>{intl.formatMessage({ id: 'admin.monitor.optimizingCacheDesc', defaultMessage: '正在执行以下优化操作:' })}</p>
            <ul id="optimization-steps">
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {intl.formatMessage({ id: 'admin.monitor.optimizingStep1Complete', defaultMessage: '清理过期连接完成 (减少了 120 个连接)' })}
              </li>
              <li>{intl.formatMessage({ id: 'admin.monitor.optimizingStep2', defaultMessage: '回收内存资源...' })}</li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <Progress percent={40} status="active" />
            </div>
          </div>
        )
      });
    }, 2000);

    setTimeout(() => {
      document.getElementById('optimization-steps').innerHTML += `
        <li>${intl.formatMessage({ id: 'admin.monitor.optimizingStep3', defaultMessage: '优化缓存键存储结构...' })}</li>
      `;
      modal.update({
        content: (
          <div>
            <p>{intl.formatMessage({ id: 'admin.monitor.optimizingCacheDesc', defaultMessage: '正在执行以下优化操作:' })}</p>
            <ul id="optimization-steps">
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {intl.formatMessage({ id: 'admin.monitor.optimizingStep1Complete', defaultMessage: '清理过期连接完成 (减少了 120 个连接)' })}
              </li>
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {intl.formatMessage({ id: 'admin.monitor.optimizingStep2Complete', defaultMessage: '内存资源回收完成 (释放了 1.2GB 内存)' })}
              </li>
              <li>{intl.formatMessage({ id: 'admin.monitor.optimizingStep3', defaultMessage: '优化缓存键存储结构...' })}</li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <Progress percent={70} status="active" />
            </div>
          </div>
        )
      });
    }, 4000);

    setTimeout(() => {
      document.getElementById('optimization-steps').innerHTML += `
        <li>${intl.formatMessage({ id: 'admin.monitor.optimizingStep4', defaultMessage: '调整缓存配置参数...' })}</li>
      `;
      
      // 如果存在内存泄漏问题，添加额外的修复步骤
      const step3CompleteText = hasMemoryLeak 
        ? intl.formatMessage({ id: 'admin.monitor.optimizingStep3Complete', defaultMessage: '缓存键存储结构优化完成 (提升了 25% 的读取效率)' }) + ' (内存泄漏已修复)'
        : intl.formatMessage({ id: 'admin.monitor.optimizingStep3Complete', defaultMessage: '缓存键存储结构优化完成 (提升了 25% 的读取效率)' });
      
      modal.update({
        content: (
          <div>
            <p>{intl.formatMessage({ id: 'admin.monitor.optimizingCacheDesc', defaultMessage: '正在执行以下优化操作:' })}</p>
            <ul id="optimization-steps">
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {intl.formatMessage({ id: 'admin.monitor.optimizingStep1Complete', defaultMessage: '清理过期连接完成 (减少了 120 个连接)' })}
              </li>
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {intl.formatMessage({ id: 'admin.monitor.optimizingStep2Complete', defaultMessage: '内存资源回收完成 (释放了 1.2GB 内存)' })}
              </li>
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {step3CompleteText}
              </li>
              <li>{intl.formatMessage({ id: 'admin.monitor.optimizingStep4', defaultMessage: '调整缓存配置参数...' })}</li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <Progress percent={90} status="active" />
            </div>
          </div>
        )
      });
    }, 6000);

    // 完成优化
    setTimeout(() => {
      // 如果存在内存泄漏问题，添加额外的修复步骤
      const step3CompleteText = hasMemoryLeak 
        ? intl.formatMessage({ id: 'admin.monitor.optimizingStep3Complete', defaultMessage: '缓存键存储结构优化完成 (提升了 25% 的读取效率)' }) + ' (内存泄漏已修复)'
        : intl.formatMessage({ id: 'admin.monitor.optimizingStep3Complete', defaultMessage: '缓存键存储结构优化完成 (提升了 25% 的读取效率)' });
      
      // 如果存在内存泄漏问题，添加额外的配置步骤
      const step4CompleteText = hasMemoryLeak 
        ? intl.formatMessage({ id: 'admin.monitor.optimizingStep4Complete', defaultMessage: '缓存配置参数调整完成 (最大连接数增加到 500)' }) + ' (添加了内存泄漏检测)'
        : intl.formatMessage({ id: 'admin.monitor.optimizingStep4Complete', defaultMessage: '缓存配置参数调整完成 (最大连接数增加到 500)' });
      
      modal.update({
        title: intl.formatMessage({ id: 'admin.monitor.optimizationComplete', defaultMessage: '缓存优化完成' }),
        content: (
          <div>
            <p>{intl.formatMessage({ id: 'admin.monitor.optimizationCompleteDesc', defaultMessage: '缓存服务器已成功优化，性能指标已恢复正常:' })}</p>
            <ul id="optimization-steps">
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {intl.formatMessage({ id: 'admin.monitor.optimizingStep1Complete', defaultMessage: '清理过期连接完成 (减少了 120 个连接)' })}
              </li>
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {intl.formatMessage({ id: 'admin.monitor.optimizingStep2Complete', defaultMessage: '内存资源回收完成 (释放了 1.2GB 内存)' })}
              </li>
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {step3CompleteText}
              </li>
              <li style={{ color: 'green' }}>
                <CheckOutlined /> {step4CompleteText}
              </li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <Progress percent={100} status="success" />
            </div>
            <div style={{ backgroundColor: '#f6ffed', padding: '10px', borderRadius: '4px', marginTop: '16px', border: '1px solid #b7eb8f' }}>
              <p style={{ color: '#52c41a', margin: 0 }}>
                <CheckCircleOutlined /> {intl.formatMessage({ id: 'admin.monitor.optimizationStats', defaultMessage: '优化结果:' })}
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>{intl.formatMessage({ id: 'admin.monitor.optimizationMemory', defaultMessage: '内存使用率: 82% → 45%' })}</li>
                <li>{intl.formatMessage({ id: 'admin.monitor.optimizationConnections', defaultMessage: '活跃连接数: 245 → 125' })}</li>
                <li>{intl.formatMessage({ id: 'admin.monitor.optimizationHitRatio', defaultMessage: '缓存命中率: 65% → 92%' })}</li>
                <li>{intl.formatMessage({ id: 'admin.monitor.optimizationResponseTime', defaultMessage: '平均响应时间: 120ms → 45ms' })}</li>
                {hasMemoryLeak && <li style={{ fontWeight: 'bold' }}>内存泄漏问题已修复，并添加了自动检测机制</li>}
              </ul>
            </div>
          </div>
        ),
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        okButtonProps: { disabled: false, style: { display: 'inline-block' } },
        onOk: () => {
          // 更新缓存服务器状态
          const updatedServices = systemStatus.services.map(item => {
            if (item.type === 'cache') {
              return { 
                ...item, 
                status: 'running', 
                uptime: '刚刚优化',
                load: 45, // 优化后负载降低
                // 如果修复了内存泄漏，添加标记
                memoryLeakFixed: hasMemoryLeak ? true : undefined
              };
            }
            return item;
          });
          
          setSystemStatus(prev => ({
            ...prev,
            services: updatedServices
          }));
          
          // 显示成功消息
          message.success(intl.formatMessage({ id: 'admin.monitor.cacheOptimized', defaultMessage: '缓存服务器已成功优化，性能已恢复正常' }));
        }
      });
    }, 8000);
  };
  
  // 服务状态列定义
  const serviceColumns = [
    {
      title: intl.formatMessage({ id: 'admin.monitor.service', defaultMessage: '服务' }),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {getServiceIcon(record.type)}
          {text}
        </Space>
      )
    },
    {
      title: intl.formatMessage({ id: 'admin.monitor.status', defaultMessage: '状态' }),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        let text = intl.formatMessage({ id: 'admin.monitor.running', defaultMessage: '运行中' });
        
        if (status === 'warning') {
          color = 'orange';
          icon = <ExclamationCircleOutlined />;
          text = intl.formatMessage({ id: 'admin.monitor.warning', defaultMessage: '警告' });
        } else if (status === 'stopped') {
          color = 'red';
          icon = <CloseCircleOutlined />;
          text = intl.formatMessage({ id: 'admin.monitor.stopped', defaultMessage: '已停止' });
        }
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: intl.formatMessage({ id: 'admin.monitor.uptime', defaultMessage: '运行时间' }),
      dataIndex: 'uptime',
      key: 'uptime'
    },
    {
      title: intl.formatMessage({ id: 'admin.monitor.load', defaultMessage: '负载' }),
      dataIndex: 'load',
      key: 'load',
      render: (load) => {
        let color = 'green';
        if (load > 70) {
          color = 'orange';
        } else if (load > 90) {
          color = 'red';
        }
        
        return <Progress percent={load} size="small" strokeColor={color} />;
      }
    },
    {
      title: intl.formatMessage({ id: 'admin.monitor.actions', defaultMessage: '操作' }),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {/* 当服务处于警告状态且是缓存服务器时，显示优化按钮 */}
          {record.status === 'warning' && record.type === 'cache' && (
            <Tooltip title={intl.formatMessage({ id: 'admin.monitor.optimize', defaultMessage: '优化' })}>
              <Button 
                type="primary" 
                size="small"
                style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                icon={<SyncOutlined />} 
                loading={actionLoading[record.id]}
                onClick={() => handleOptimizeCache()}
              >
                {intl.formatMessage({ id: 'admin.monitor.optimize', defaultMessage: '优化' })}
              </Button>
            </Tooltip>
          )}
          
          <Tooltip title={intl.formatMessage({ id: 'admin.monitor.start', defaultMessage: '启动' })}>
            <Button 
              type="primary" 
              size="small"
              icon={<CheckOutlined />} 
              loading={actionLoading[record.id]}
              onClick={() => handleStartService(record)}
              disabled={record.status === 'running' || record.status === 'warning'}
            />
          </Tooltip>
          
          <Tooltip title={intl.formatMessage({ id: 'admin.monitor.stop', defaultMessage: '停止' })}>
            <Button 
              type="primary" 
              danger
              size="small"
              icon={<CloseCircleOutlined />} 
              loading={actionLoading[record.id]}
              onClick={() => handleStopService(record)}
              disabled={record.status === 'stopped'}
            />
          </Tooltip>
          
          <Tooltip title={intl.formatMessage({ id: 'admin.monitor.restart', defaultMessage: '重启' })}>
            <Button 
              type="primary" 
              size="small"
              style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
              icon={<SyncOutlined />} 
              loading={actionLoading[record.id]}
              onClick={() => handleRestartService(record)}
              disabled={record.status === 'stopped'}
            />
          </Tooltip>
        </Space>
      )
    }
  ];
  
  return (
    <div className="admin-system-monitor">
      <Card className="admin-card">
        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2><FormattedMessage id="admin.monitor.title" defaultMessage="系统监控" /></h2>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={fetchSystemStatus}
            loading={loading}
          >
            <FormattedMessage id="admin.monitor.refresh" defaultMessage="刷新" />
          </Button>
        </div>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'admin.monitor.cpu', defaultMessage: 'CPU使用率' })}
                value={systemStatus.cpu}
                suffix="%"
                valueStyle={{ color: systemStatus.cpu > 80 ? '#cf1322' : systemStatus.cpu > 50 ? '#faad14' : '#3f8600' }}
              />
              <Progress 
                percent={systemStatus.cpu} 
                status={systemStatus.cpu > 80 ? 'exception' : systemStatus.cpu > 50 ? 'warning' : 'success'} 
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'admin.monitor.memory', defaultMessage: '内存使用率' })}
                value={systemStatus.memory}
                suffix="%"
                valueStyle={{ color: systemStatus.memory > 80 ? '#cf1322' : systemStatus.memory > 50 ? '#faad14' : '#3f8600' }}
              />
              <Progress 
                percent={systemStatus.memory} 
                status={systemStatus.memory > 80 ? 'exception' : systemStatus.memory > 50 ? 'warning' : 'success'} 
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'admin.monitor.disk', defaultMessage: '磁盘使用率' })}
                value={systemStatus.disk}
                suffix="%"
                valueStyle={{ color: systemStatus.disk > 80 ? '#cf1322' : systemStatus.disk > 50 ? '#faad14' : '#3f8600' }}
              />
              <Progress 
                percent={systemStatus.disk} 
                status={systemStatus.disk > 80 ? 'exception' : systemStatus.disk > 50 ? 'warning' : 'success'} 
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Card title={intl.formatMessage({ id: 'admin.monitor.services', defaultMessage: '服务状态' })}>
          <Table 
            columns={serviceColumns} 
            dataSource={systemStatus.services} 
            rowKey="id"
            pagination={false}
            loading={loading}
          />
        </Card>
      </Card>
    </div>
  );
};

export default SystemMonitor; 