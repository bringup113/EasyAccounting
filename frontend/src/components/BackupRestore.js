import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, Card, Upload, message, Spin, Divider, Typography, Space, Alert } from 'antd';
import { UploadOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { createBookBackup, restoreFromBackup } from '../services/backupService';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

/**
 * 备份和恢复组件
 */
const BackupRestore = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);
  
  // 从Redux获取当前账本ID
  const currentBookId = useSelector(state => state.book.currentBook?.id);
  
  // 处理备份
  const handleBackup = async () => {
    if (!currentBookId) {
      message.error(intl.formatMessage({ 
        id: 'backup.noBookSelected', 
        defaultMessage: '请先选择一个账本' 
      }));
      return;
    }
    
    setLoading(true);
    try {
      const result = await createBookBackup(currentBookId, dispatch, intl);
      if (result.success) {
        message.success(intl.formatMessage({ 
          id: 'backup.downloadStarted', 
          defaultMessage: '备份文件下载已开始' 
        }));
      }
    } catch (error) {
      console.error('备份过程中出错:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理恢复
  const handleRestore = async (file) => {
    setLoading(true);
    setRestoreResult(null);
    
    try {
      const result = await restoreFromBackup(file, dispatch, intl);
      setRestoreResult(result);
      return false; // 阻止默认上传行为
    } catch (error) {
      console.error('恢复过程中出错:', error);
    } finally {
      setLoading(false);
    }
    
    return false; // 阻止默认上传行为
  };
  
  // 上传组件属性
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    beforeUpload: handleRestore,
    showUploadList: false,
  };
  
  return (
    <Card title={intl.formatMessage({ id: 'backup.title', defaultMessage: '备份与恢复' })}>
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 备份部分 */}
          <div>
            <Title level={4}>
              {intl.formatMessage({ id: 'backup.createBackup', defaultMessage: '创建备份' })}
            </Title>
            <Paragraph>
              {intl.formatMessage({ 
                id: 'backup.createDescription', 
                defaultMessage: '创建当前账本的完整备份，包括所有交易、账户、类别、标签和人员数据。' 
              })}
            </Paragraph>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleBackup}
              disabled={!currentBookId}
            >
              {intl.formatMessage({ id: 'backup.backupButton', defaultMessage: '备份当前账本' })}
            </Button>
          </div>
          
          <Divider />
          
          {/* 恢复部分 */}
          <div>
            <Title level={4}>
              {intl.formatMessage({ id: 'backup.restoreBackup', defaultMessage: '从备份恢复' })}
            </Title>
            <Paragraph>
              {intl.formatMessage({ 
                id: 'backup.restoreDescription', 
                defaultMessage: '从之前创建的备份文件中恢复数据。' 
              })}
            </Paragraph>
            
            <Alert
              message={intl.formatMessage({ 
                id: 'backup.restoreWarning', 
                defaultMessage: '警告' 
              })}
              description={intl.formatMessage({ 
                id: 'backup.restoreWarningText', 
                defaultMessage: '恢复操作可能会覆盖现有数据。建议在恢复前先创建当前数据的备份。' 
              })}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                {intl.formatMessage({ 
                  id: 'backup.dragText', 
                  defaultMessage: '点击或拖拽备份文件到此区域' 
                })}
              </p>
              <p className="ant-upload-hint">
                {intl.formatMessage({ 
                  id: 'backup.uploadHint', 
                  defaultMessage: '仅支持 .json 格式的备份文件' 
                })}
              </p>
            </Dragger>
          </div>
          
          {/* 恢复结果 */}
          {restoreResult && (
            <div style={{ marginTop: 16 }}>
              {restoreResult.success ? (
                <Alert
                  message={intl.formatMessage({ 
                    id: 'backup.restoreSuccess', 
                    defaultMessage: '恢复成功' 
                  })}
                  description={intl.formatMessage({ 
                    id: 'backup.restoreSuccessText', 
                    defaultMessage: '数据已成功从备份文件恢复。' 
                  })}
                  type="success"
                  showIcon
                />
              ) : (
                <Alert
                  message={intl.formatMessage({ 
                    id: 'backup.restoreError', 
                    defaultMessage: '恢复失败' 
                  })}
                  description={restoreResult.error?.message || intl.formatMessage({ 
                    id: 'backup.restoreErrorText', 
                    defaultMessage: '从备份恢复数据时发生错误。' 
                  })}
                  type="error"
                  showIcon
                />
              )}
            </div>
          )}
          
          <Divider />
          
          {/* 帮助信息 */}
          <div>
            <Title level={4} icon={<QuestionCircleOutlined />}>
              {intl.formatMessage({ id: 'backup.helpTitle', defaultMessage: '关于备份与恢复' })}
            </Title>
            <Paragraph>
              <ul>
                <li>
                  <Text>
                    {intl.formatMessage({ 
                      id: 'backup.helpRegular', 
                      defaultMessage: '建议定期备份您的数据，以防数据丢失。' 
                    })}
                  </Text>
                </li>
                <li>
                  <Text>
                    {intl.formatMessage({ 
                      id: 'backup.helpFormat', 
                      defaultMessage: '备份文件为JSON格式，包含您账本的完整数据。' 
                    })}
                  </Text>
                </li>
                <li>
                  <Text>
                    {intl.formatMessage({ 
                      id: 'backup.helpRestore', 
                      defaultMessage: '恢复操作会将备份文件中的数据导入到系统中，可能会覆盖现有数据。' 
                    })}
                  </Text>
                </li>
              </ul>
            </Paragraph>
          </div>
        </Space>
      </Spin>
    </Card>
  );
};

export default BackupRestore; 