import React from 'react';
import { useIntl } from 'react-intl';
import { Row, Col, Typography, Space } from 'antd';
import BackupRestore from '../components/BackupRestore';
import { exportToJson, exportToCsv, exportToExcel } from '../services/exportService';
import ExportDataCard from '../components/ExportDataCard';

const { Title, Text } = Typography;

/**
 * 备份和导出页面
 */
const BackupRestorePage = () => {
  const intl = useIntl();
  
  return (
    <div className="backup-restore-page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          {intl.formatMessage({ 
            id: 'backupRestore.pageTitle', 
            defaultMessage: '备份与数据导出' 
          })}
        </Title>
        <Text type="secondary">
          {intl.formatMessage({ 
            id: 'backupRestore.pageSubtitle', 
            defaultMessage: '管理您的数据备份和导出' 
          })}
        </Text>
      </div>
      
      <Row gutter={[16, 16]}>
        {/* 备份和恢复卡片 */}
        <Col xs={24} lg={12}>
          <BackupRestore />
        </Col>
        
        {/* 数据导出卡片 */}
        <Col xs={24} lg={12}>
          <ExportDataCard 
            exportToJson={exportToJson}
            exportToCsv={exportToCsv}
            exportToExcel={exportToExcel}
          />
        </Col>
      </Row>
    </div>
  );
};

export default BackupRestorePage; 