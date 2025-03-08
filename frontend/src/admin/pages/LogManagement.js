import React from 'react';
import { Card } from 'antd';
import { FormattedMessage } from 'react-intl';

const LogManagement = () => {
  return (
    <div className="admin-log-management">
      <Card className="admin-card">
        <div className="admin-page-header">
          <h2><FormattedMessage id="admin.logs.title" defaultMessage="日志管理" /></h2>
        </div>
        <p><FormattedMessage id="admin.logs.comingSoon" defaultMessage="功能开发中，敬请期待..." /></p>
      </Card>
    </div>
  );
};

export default LogManagement; 