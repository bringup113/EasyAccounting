import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { setLanguage } from '../store/settingsSlice';

const { Option } = Select;

const LanguageSwitcher = () => {
  const dispatch = useDispatch();
  const { language } = useSelector(state => state.settings || { language: 'zh-CN' });

  const handleLanguageChange = value => {
    dispatch(setLanguage(value));
  };

  return (
    <div className="language-switcher">
      <GlobalOutlined style={{ marginRight: 8 }} />
      <Select
        value={language}
        onChange={handleLanguageChange}
        popupMatchSelectWidth={false}
        className="language-switcher"
      >
        <Option value="zh-CN">中文</Option>
        <Option value="en-US">English</Option>
      </Select>
    </div>
  );
};

export default LanguageSwitcher; 