import React from 'react';
import { Skeleton, Card, Row, Col, Space } from 'antd';

/**
 * 交易列表骨架屏
 */
export const TransactionListSkeleton = ({ count = 5 }) => {
  return (
    <>
      {Array(count).fill().map((_, index) => (
        <Card key={index} style={{ marginBottom: 16 }}>
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </Card>
      ))}
    </>
  );
};

/**
 * 账户列表骨架屏
 */
export const AccountListSkeleton = ({ count = 3 }) => {
  return (
    <Row gutter={[16, 16]}>
      {Array(count).fill().map((_, index) => (
        <Col xs={24} sm={12} md={8} key={index}>
          <Card>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

/**
 * 统计卡片骨架屏
 */
export const StatisticsSkeleton = () => {
  return (
    <Row gutter={[16, 16]}>
      {Array(4).fill().map((_, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card>
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

/**
 * 图表骨架屏
 */
export const ChartSkeleton = ({ height = 300 }) => {
  return (
    <Card>
      <Skeleton.Input active block style={{ height, width: '100%' }} />
    </Card>
  );
};

/**
 * 表单骨架屏
 */
export const FormSkeleton = ({ rows = 5 }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {Array(rows).fill().map((_, index) => (
        <div key={index}>
          <Skeleton.Input active style={{ width: '30%', marginBottom: 8 }} />
          <Skeleton.Input active block style={{ height: 32 }} />
        </div>
      ))}
      <div style={{ marginTop: 24 }}>
        <Skeleton.Button active style={{ width: 100, marginRight: 8 }} />
        <Skeleton.Button active style={{ width: 100 }} />
      </div>
    </Space>
  );
};

/**
 * 日历骨架屏
 */
export const CalendarSkeleton = () => {
  return (
    <Card>
      <Skeleton.Input active style={{ width: '100%', height: 40, marginBottom: 16 }} />
      <Row gutter={[8, 8]}>
        {Array(7).fill().map((_, index) => (
          <Col span={3} key={`header-${index}`}>
            <Skeleton.Input active style={{ width: '100%', height: 24 }} />
          </Col>
        ))}
        {Array(35).fill().map((_, index) => (
          <Col span={3} key={`day-${index}`}>
            <Skeleton.Input active style={{ width: '100%', height: 80, marginTop: 8 }} />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

/**
 * 详情页骨架屏
 */
export const DetailSkeleton = () => {
  return (
    <Card>
      <Skeleton active avatar={{ size: 'large', shape: 'square' }} paragraph={{ rows: 4 }} />
      <div style={{ marginTop: 24 }}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    </Card>
  );
}; 