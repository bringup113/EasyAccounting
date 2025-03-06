import { combineReducers } from 'redux';
import authReducer from './authReducer';
import bookReducer from './bookReducer';
import accountReducer from './accountReducer';
import transactionReducer from './transactionReducer';
import budgetReducer from './budgetReducer';
import alertReducer from './alertReducer';
import settingsReducer from './settingsReducer';

export default combineReducers({
  auth: authReducer,
  book: bookReducer,
  account: accountReducer,
  transaction: transactionReducer,
  budget: budgetReducer,
  alert: alertReducer,
  settings: settingsReducer
}); 