import React, { Component } from 'react';
import { Result, Button } from 'antd';
import { connect } from 'react-redux';
import { sendErrorNotification } from '../services/notificationService';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('应用错误:', error);
    
    if (this.props.dispatch) {
      sendErrorNotification(this.props.dispatch, {
        title: '应用发生错误',
        message: error.message || '未知错误'
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="应用发生错误"
          subTitle={this.state.error?.message || '未知错误'}
          extra={
            <Button type="primary" onClick={this.handleReset}>
              重新加载应用
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default connect()(ErrorBoundary); 