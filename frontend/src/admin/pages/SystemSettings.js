import React from 'react';
import { Card } from 'antd';
import { FormattedMessage } from 'react-intl';

const SystemSettings = () => {
  return (
    <div className="admin-system-settings">
      <Card className="admin-card">
        <div className="admin-page-header">
          <h2><FormattedMessage id="admin.settings.title" defaultMessage="系统设置" /></h2>
        </div>
        <p><FormattedMessage id="admin.settings.comingSoon" defaultMessage="功能开发中，敬请期待..." /></p>
      </Card>
    </div>
  );
};

export default SystemSettings;
