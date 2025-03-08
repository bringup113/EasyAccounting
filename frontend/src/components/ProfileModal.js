import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  message,
  Avatar,
  Upload,
  App,
  Typography,
  Space,
  Row,
  Col,
  Tabs
} from 'antd';
import { 
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { updateUser, updatePassword, loadUser } from '../store/authSlice';
import ImgCrop from 'antd-img-crop';

const { Text } = Typography;

// 个人资料模态窗口组件
const ProfileModal = ({ visible, onCancel }) => {
  const dispatch = useDispatch();
  
  // 当模态框打开时加载用户信息
  useEffect(() => {
    if (visible && localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [visible, dispatch]);
  
  return (
    <App>
      <Modal
        title={<FormattedMessage id="settings.profile" defaultMessage="个人资料" />}
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
      >
        <AccountSettings onCancel={onCancel} key={visible ? Date.now() : 'profile'} />
      </Modal>
    </App>
  );
};

// 账号设置组件
const AccountSettings = ({ onCancel }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth || { user: null });
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // 设置头像URL
  useEffect(() => {
    if (user?.avatar) {
      const fullUrl = user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${user.avatar}`.replace('/api/uploads', '/uploads');
      setImageUrl(fullUrl);
    }
  }, [user]);

  // 设置个人资料表单的初始值
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
      
      // 设置头像URL
      if (user.avatar) {
        const fullUrl = user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${user.avatar}`.replace('/api/uploads', '/uploads');
        setImageUrl(fullUrl);
      }
    }
  }, [user, profileForm]);

  // 处理表单提交
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (activeTab === 'profile') {
        // 处理个人资料更新
        const values = await profileForm.validateFields();
        const userData = {
          username: values.name,
          email: values.email,
          avatar: values.avatar
        };
        
        await dispatch(updateUser(userData)).unwrap();
        messageApi.success('个人资料更新成功');
      } else if (activeTab === 'password') {
        // 处理密码更新
        const values = await passwordForm.validateFields();
        if (values.newPassword !== values.confirmPassword) {
          messageApi.error('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        
        await dispatch(updatePassword({
          currentPassword: values.oldPassword,
          newPassword: values.newPassword
        })).unwrap();
        
        messageApi.success('密码修改成功');
        passwordForm.resetFields();
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        messageApi.error('请检查表单填写是否正确');
      } else {
        // API错误
        messageApi.error(error || (activeTab === 'profile' ? '个人资料更新失败' : '密码修改失败'));
      }
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'profile',
      label: (
        <Space>
          <UserOutlined />
          <FormattedMessage id="settings.profile" defaultMessage="个人资料" />
        </Space>
      ),
      children: (
        <Form 
          form={profileForm}
          layout="vertical" 
          initialValues={{ 
            name: user?.username || '',
            email: user?.email || '',
            avatar: user?.avatar || ''
          }}
          onFinish={() => handleSubmit()}
        >
          <Row gutter={[24, 0]} align="middle">
            <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
              <Form.Item
                name="avatar"
                hidden
              >
                <Input />
              </Form.Item>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />} 
                  src={imageUrl}
                  style={{ marginBottom: 16 }}
                />
                <ImgCrop rotate shape="round" grid>
                  <Upload
                    name="avatar"
                    showUploadList={false}
                    action={`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/upload`}
                    headers={{
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                    }}
                    beforeUpload={(file) => {
                      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                      if (!isJpgOrPng) {
                        messageApi.error('只能上传JPG/PNG格式的图片!');
                      }
                      const isLt2M = file.size / 1024 / 1024 < 2;
                      if (!isLt2M) {
                        messageApi.error('图片必须小于2MB!');
                      }
                      setUploading(true);
                      return isJpgOrPng && isLt2M;
                    }}
                    onChange={(info) => {
                      if (info.file.status === 'uploading') {
                        setUploading(true);
                        return;
                      }
                      if (info.file.status === 'done') {
                        setUploading(false);
                        messageApi.success('头像上传成功!');
                        // 获取服务器返回的图片URL
                        const avatarUrl = info.file.response.url;
                        // 修复URL路径，确保不包含多余的/api前缀
                        const fixedAvatarUrl = avatarUrl.replace('/api/uploads', '/uploads');
                        // 更新表单值和预览图
                        setImageUrl(fixedAvatarUrl);
                        profileForm.setFieldsValue({ avatar: fixedAvatarUrl });
                        
                        // 立即更新用户头像
                        dispatch(updateUser({
                          username: user.username,
                          email: user.email,
                          avatar: fixedAvatarUrl
                        })).then(() => {
                          // 重新加载用户信息以更新头像
                          dispatch(loadUser());
                        });
                      } else if (info.file.status === 'error') {
                        setUploading(false);
                        console.error('上传失败:', info.file.error, info.file.response);
                        messageApi.error(`头像上传失败: ${info.file.response?.message || '服务器错误'}`);
                      }
                    }}
                    customRequest={({ file, onSuccess, onError, onProgress }) => {
                      // 创建FormData对象
                      const formData = new FormData();
                      formData.append('avatar', file);
                      
                      // 使用axios直接上传
                      const xhr = new XMLHttpRequest();
                      xhr.open('POST', `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/upload`, true);
                      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                      
                      // 进度事件
                      xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                          const percent = Math.round((e.loaded / e.total) * 100);
                          onProgress({ percent });
                        }
                      };
                      
                      // 完成事件
                      xhr.onload = () => {
                        if (xhr.status === 200) {
                          const response = JSON.parse(xhr.responseText);
                          onSuccess(response, xhr);
                        } else {
                          onError({ status: xhr.status });
                        }
                      };
                      
                      // 错误事件
                      xhr.onerror = () => {
                        onError({ status: xhr.status });
                      };
                      
                      // 发送请求
                      xhr.send(formData);
                      
                      // 返回上传取消函数
                      return {
                        abort() {
                          xhr.abort();
                        }
                      };
                    }}
                  >
                    <Button 
                      icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} 
                      style={{ 
                        width: '100%', 
                        marginBottom: 8,
                        borderRadius: '4px'
                      }}
                      disabled={uploading}
                    >
                      {uploading ? 
                        <FormattedMessage id="common.uploading" defaultMessage="上传中..." /> : 
                        <FormattedMessage id="settings.uploadAvatar" defaultMessage="上传头像" />
                      }
                    </Button>
                  </Upload>
                </ImgCrop>
                <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
                  <FormattedMessage id="settings.avatarHint" defaultMessage="支持JPG、PNG格式，文件小于2MB" />
                </Text>
                <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                  <FormattedMessage id="settings.avatarCropHint" defaultMessage="可拖动调整裁剪区域" />
                </Text>
              </div>
            </Col>
            
            <Col xs={24} sm={16}>
              <Form.Item
                name="name"
                label={
                  <Space>
                    <UserOutlined />
                    <FormattedMessage id="settings.username" defaultMessage="用户名" />
                  </Space>
                }
                rules={[{ required: true, message: '请输入用户名' }]}
                extra={
                  <Space>
                    <InfoCircleOutlined />
                    <Text type="secondary">
                      <FormattedMessage id="settings.currentUsername" defaultMessage="当前用户名" />: {user?.username || <FormattedMessage id="settings.notSet" defaultMessage="未设置" />}
                    </Text>
                  </Space>
                }
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item
                name="email"
                label={
                  <Space>
                    <MailOutlined />
                    <FormattedMessage id="settings.email" defaultMessage="邮箱" />
                  </Space>
                }
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    },
    {
      key: 'password',
      label: (
        <Space>
          <LockOutlined />
          <FormattedMessage id="settings.changePassword" defaultMessage="修改密码" />
        </Space>
      ),
      children: (
        <Form 
          form={passwordForm}
          layout="vertical"
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={24} md={8}>
              <Form.Item 
                name="oldPassword" 
                label={<FormattedMessage id="settings.oldPassword" defaultMessage="旧密码" />}
                rules={[{ required: true, message: '请输入旧密码' }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                name="newPassword" 
                label={<FormattedMessage id="settings.newPassword" defaultMessage="新密码" />}
                rules={[{ required: true, message: '请输入新密码' }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                name="confirmPassword" 
                label={<FormattedMessage id="settings.confirmPassword" defaultMessage="确认新密码" />}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={items}
        style={{ marginBottom: 24 }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button onClick={onCancel}>
          <FormattedMessage id="common.cancel" defaultMessage="取消" />
        </Button>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSubmit}
          loading={loading}
        >
          <FormattedMessage id="common.save" defaultMessage="保存" />
        </Button>
      </div>
    </>
  );
};

export default ProfileModal; 