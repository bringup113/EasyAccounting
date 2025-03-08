import React from 'react';
import { Card } from 'antd';
import { FormattedMessage } from 'react-intl';

const BackupManagement = () => {
  return (
    <div className="admin-backup-management">
      <Card className="admin-card">
        <div className="admin-page-header">
          <h2><FormattedMessage id="admin.backups.title" defaultMessage="备份管理" /></h2>
        </div>
        <p><FormattedMessage id="admin.backups.comingSoon" defaultMessage="功能开发中，敬请期待..." /></p>
      </Card>
    </div>
  );
};

export default BackupManagement; 