import React, { useState } from 'react';
import { Button, Modal, Form, Select, Input, message, Tooltip, Space, Divider, Table, Tag } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { 
  ShareAltOutlined, 
  SwapOutlined, 
  UserAddOutlined, 
  DeleteOutlined, 
  EditOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { transferBook, inviteUserToBook, removeUserFromBook, updateUserPermission } from '../../services/bookService';

const { Option } = Select;
const { confirm } = Modal;

// 权限级别定义
const PERMISSION_LEVELS = {
  CREATOR: 'creator',
  MANAGER: 'manager',
  COLLABORATOR: 'collaborator',
  VIEWER: 'viewer'
};

// 权限级别对应的中文名称和颜色
const PERMISSION_LABELS = {
  [PERMISSION_LEVELS.CREATOR]: { label: '创建者', color: 'gold' },
  [PERMISSION_LEVELS.MANAGER]: { label: '管理者', color: 'green' },
  [PERMISSION_LEVELS.COLLABORATOR]: { label: '协助者', color: 'blue' },
  [PERMISSION_LEVELS.VIEWER]: { label: '查看者', color: 'purple' }
};

// 权限级别对应的英文名称
const PERMISSION_LABELS_EN = {
  [PERMISSION_LEVELS.CREATOR]: { label: 'Creator', color: 'gold' },
  [PERMISSION_LEVELS.MANAGER]: { label: 'Manager', color: 'green' },
  [PERMISSION_LEVELS.COLLABORATOR]: { label: 'Collaborator', color: 'blue' },
  [PERMISSION_LEVELS.VIEWER]: { label: 'Viewer', color: 'purple' }
};

const BookActions = ({ book, onSuccess }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [transferForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector(state => state.auth);
  const { locale } = useSelector(state => state.settings);
  
  // 判断当前用户是否是创建者
  const isCreator = book.creatorId === currentUser?.id;
  
  // 判断当前用户是否是管理者或创建者
  const isManagerOrCreator = isCreator || (book.members && book.members.some(
    member => member.userId === currentUser?.id && 
    (member.permission === PERMISSION_LEVELS.MANAGER || member.permission === PERMISSION_LEVELS.CREATOR)
  ));

  // 处理转让账本
  const handleTransferBook = async (values) => {
    setLoading(true);
    try {
      await transferBook(book.id, values.userId);
      message.success(intl.formatMessage({ id: 'book.transfer.success' }));
      setTransferModalVisible(false);
      transferForm.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(intl.formatMessage({ id: 'book.transfer.error' }));
    } finally {
      setLoading(false);
    }
  };

  // 处理邀请用户
  const handleInviteUser = async (values) => {
    setLoading(true);
    try {
      await inviteUserToBook(book.id, values.email, values.permission);
      message.success(intl.formatMessage({ id: 'book.invite.success' }));
      setInviteModalVisible(false);
      inviteForm.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(intl.formatMessage({ id: 'book.invite.error' }));
    } finally {
      setLoading(false);
    }
  };

  // 处理移除用户
  const handleRemoveUser = (userId) => {
    confirm({
      title: intl.formatMessage({ id: 'book.member.remove.confirm' }),
      icon: <ExclamationCircleOutlined />,
      content: intl.formatMessage({ id: 'book.member.remove.confirmContent' }),
      onOk: async () => {
        try {
          await removeUserFromBook(book.id, userId);
          message.success(intl.formatMessage({ id: 'book.member.remove.success' }));
          if (onSuccess) onSuccess();
        } catch (error) {
          message.error(intl.formatMessage({ id: 'book.member.remove.error' }));
        }
      }
    });
  };

  // 处理更新用户权限
  const handleUpdatePermission = async (userId, permission) => {
    try {
      await updateUserPermission(book.id, userId, permission);
      message.success(intl.formatMessage({ id: 'book.member.permission.success' }));
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(intl.formatMessage({ id: 'book.member.permission.error' }));
    }
  };

  // 成员列表表格列定义
  const membersColumns = [
    {
      title: intl.formatMessage({ id: 'book.member.name' }),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text}
          {record.userId === book.creatorId && (
            <Tag color="gold">
              {intl.formatMessage({ id: 'book.member.owner' })}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: intl.formatMessage({ id: 'book.member.email' }),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: intl.formatMessage({ id: 'book.member.permission' }),
      dataIndex: 'permission',
      key: 'permission',
      render: (permission, record) => {
        // 如果是创建者，不允许修改权限
        if (record.userId === book.creatorId) {
          return (
            <Tag color={PERMISSION_LABELS[PERMISSION_LEVELS.CREATOR].color}>
              {locale === 'zh-CN' 
                ? PERMISSION_LABELS[PERMISSION_LEVELS.CREATOR].label 
                : PERMISSION_LABELS_EN[PERMISSION_LEVELS.CREATOR].label}
            </Tag>
          );
        }
        
        // 如果当前用户是创建者或管理者，允许修改其他用户的权限
        if (isManagerOrCreator && record.userId !== currentUser?.id) {
          return (
            <Select
              defaultValue={permission}
              style={{ width: 120 }}
              onChange={(value) => handleUpdatePermission(record.userId, value)}
              disabled={loading}
            >
              <Option value={PERMISSION_LEVELS.MANAGER}>
                {locale === 'zh-CN' 
                  ? PERMISSION_LABELS[PERMISSION_LEVELS.MANAGER].label 
                  : PERMISSION_LABELS_EN[PERMISSION_LEVELS.MANAGER].label}
              </Option>
              <Option value={PERMISSION_LEVELS.COLLABORATOR}>
                {locale === 'zh-CN' 
                  ? PERMISSION_LABELS[PERMISSION_LEVELS.COLLABORATOR].label 
                  : PERMISSION_LABELS_EN[PERMISSION_LEVELS.COLLABORATOR].label}
              </Option>
              <Option value={PERMISSION_LEVELS.VIEWER}>
                {locale === 'zh-CN' 
                  ? PERMISSION_LABELS[PERMISSION_LEVELS.VIEWER].label 
                  : PERMISSION_LABELS_EN[PERMISSION_LEVELS.VIEWER].label}
              </Option>
            </Select>
          );
        }
        
        // 其他情况只显示权限标签
        return (
          <Tag color={PERMISSION_LABELS[permission].color}>
            {locale === 'zh-CN' 
              ? PERMISSION_LABELS[permission].label 
              : PERMISSION_LABELS_EN[permission].label}
          </Tag>
        );
      }
    },
    {
      title: intl.formatMessage({ id: 'book.member.actions' }),
      key: 'actions',
      render: (_, record) => {
        // 不能移除创建者和自己
        if (record.userId === book.creatorId || record.userId === currentUser?.id) {
          return null;
        }
        
        // 只有创建者和管理者可以移除其他用户
        if (isManagerOrCreator) {
          return (
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveUser(record.userId)}
              disabled={loading}
            />
          );
        }
        
        return null;
      }
    }
  ];

  return (
    <>
      <Space split={<Divider type="vertical" />}>
        {/* 查看成员按钮 */}
        <Tooltip title={intl.formatMessage({ id: 'book.members.view' })}>
          <Button 
            type="text" 
            icon={<UserOutlined />} 
            onClick={() => setMembersModalVisible(true)}
          />
        </Tooltip>
        
        {/* 邀请用户按钮 - 只有创建者和管理者可以邀请 */}
        {isManagerOrCreator && (
          <Tooltip title={intl.formatMessage({ id: 'book.invite.user' })}>
            <Button 
              type="text" 
              icon={<UserAddOutlined />} 
              onClick={() => setInviteModalVisible(true)}
            />
          </Tooltip>
        )}
        
        {/* 转让账本按钮 - 只有创建者可以转让 */}
        {isCreator && (
          <Tooltip title={intl.formatMessage({ id: 'book.transfer' })}>
            <Button 
              type="text" 
              icon={<SwapOutlined />} 
              onClick={() => setTransferModalVisible(true)}
            />
          </Tooltip>
        )}
      </Space>
      
      {/* 转让账本对话框 */}
      <Modal
        title={intl.formatMessage({ id: 'book.transfer.title' })}
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransferBook}
        >
          <Form.Item
            name="userId"
            label={intl.formatMessage({ id: 'book.transfer.selectUser' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'book.transfer.selectUserRequired' }) }]}
          >
            <Select placeholder={intl.formatMessage({ id: 'book.transfer.selectUserPlaceholder' })}>
              {book.members && book.members
                .filter(member => member.userId !== currentUser?.id)
                .map(member => (
                  <Option key={member.userId} value={member.userId}>
                    {member.name} ({member.email})
                  </Option>
                ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {intl.formatMessage({ id: 'book.transfer.confirm' })}
              </Button>
              <Button onClick={() => setTransferModalVisible(false)}>
                {intl.formatMessage({ id: 'common.cancel' })}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 邀请用户对话框 */}
      <Modal
        title={intl.formatMessage({ id: 'book.invite.title' })}
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={handleInviteUser}
        >
          <Form.Item
            name="email"
            label={intl.formatMessage({ id: 'book.invite.email' })}
            rules={[
              { required: true, message: intl.formatMessage({ id: 'book.invite.emailRequired' }) },
              { type: 'email', message: intl.formatMessage({ id: 'book.invite.emailInvalid' }) }
            ]}
          >
            <Input placeholder={intl.formatMessage({ id: 'book.invite.emailPlaceholder' })} />
          </Form.Item>
          
          <Form.Item
            name="permission"
            label={intl.formatMessage({ id: 'book.invite.permission' })}
            initialValue={PERMISSION_LEVELS.VIEWER}
            rules={[{ required: true, message: intl.formatMessage({ id: 'book.invite.permissionRequired' }) }]}
          >
            <Select>
              <Option value={PERMISSION_LEVELS.MANAGER}>
                {locale === 'zh-CN' 
                  ? PERMISSION_LABELS[PERMISSION_LEVELS.MANAGER].label 
                  : PERMISSION_LABELS_EN[PERMISSION_LEVELS.MANAGER].label}
                {' - '}
                {intl.formatMessage({ id: 'book.permission.manager.description' })}
              </Option>
              <Option value={PERMISSION_LEVELS.COLLABORATOR}>
                {locale === 'zh-CN' 
                  ? PERMISSION_LABELS[PERMISSION_LEVELS.COLLABORATOR].label 
                  : PERMISSION_LABELS_EN[PERMISSION_LEVELS.COLLABORATOR].label}
                {' - '}
                {intl.formatMessage({ id: 'book.permission.collaborator.description' })}
              </Option>
              <Option value={PERMISSION_LEVELS.VIEWER}>
                {locale === 'zh-CN' 
                  ? PERMISSION_LABELS[PERMISSION_LEVELS.VIEWER].label 
                  : PERMISSION_LABELS_EN[PERMISSION_LEVELS.VIEWER].label}
                {' - '}
                {intl.formatMessage({ id: 'book.permission.viewer.description' })}
              </Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {intl.formatMessage({ id: 'book.invite.send' })}
              </Button>
              <Button onClick={() => setInviteModalVisible(false)}>
                {intl.formatMessage({ id: 'common.cancel' })}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 成员列表对话框 */}
      <Modal
        title={intl.formatMessage({ id: 'book.members.title' })}
        open={membersModalVisible}
        onCancel={() => setMembersModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setMembersModalVisible(false)}>
            {intl.formatMessage({ id: 'common.close' })}
          </Button>
        ]}
        width={700}
      >
        <Table
          dataSource={book.members || []}
          columns={membersColumns}
          rowKey="userId"
          pagination={false}
        />
      </Modal>
    </>
  );
};

export default BookActions; 