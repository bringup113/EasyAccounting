import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import transactionReducer, {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  setCurrentTransaction,
  clearError,
  clearTransactions
} from '../transactionSlice';

// 创建模拟 store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('transactionSlice', () => {
  describe('reducer', () => {
    it('应该返回初始状态', () => {
      const initialState = {
        transactions: [],
        transaction: null,
        stats: null,
        loading: false,
        error: null,
        pagination: null,
        total: 0,
      };
      
      expect(transactionReducer(undefined, { type: undefined })).toEqual(initialState);
    });

    it('应该处理 clearError', () => {
      const initialState = {
        transactions: [],
        transaction: null,
        stats: null,
        loading: false,
        error: 'Some error',
        pagination: null,
        total: 0,
      };
      
      const action = clearError();
      const newState = transactionReducer(initialState, action);
      
      expect(newState.error).toBe(null);
    });

    it('应该处理 clearTransactions', () => {
      const initialState = {
        transactions: [{ id: '1', amount: 100 }],
        transaction: null,
        stats: null,
        loading: false,
        error: null,
        pagination: { page: 1, limit: 10 },
        total: 1,
      };
      
      const action = clearTransactions();
      const newState = transactionReducer(initialState, action);
      
      expect(newState.transactions).toEqual([]);
      expect(newState.pagination).toBe(null);
      expect(newState.total).toBe(0);
    });

    it('应该处理 fetchTransactions.pending', () => {
      const initialState = {
        transactions: [],
        transaction: null,
        stats: null,
        loading: false,
        error: null,
        pagination: null,
        total: 0,
      };
      
      const action = { type: 'transactions/fetchTransactions/pending' };
      const newState = transactionReducer(initialState, action);
      
      expect(newState.loading).toBe(true);
    });

    it('应该处理 fetchTransactions.fulfilled', () => {
      const initialState = {
        transactions: [],
        transaction: null,
        stats: null,
        loading: true,
        error: null,
        pagination: null,
        total: 0,
      };
      
      const action = { 
        type: 'transactions/fetchTransactions/fulfilled',
        payload: {
          data: [{ id: '1', description: '交易1' }],
          pagination: { page: 1, limit: 10 },
          total: 1
        }
      };
      
      const newState = transactionReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.transactions).toEqual(action.payload.data);
      expect(newState.pagination).toEqual(action.payload.pagination);
      expect(newState.total).toBe(action.payload.total);
    });

    it('应该处理 fetchTransactions.rejected', () => {
      const initialState = {
        transactions: [],
        transaction: null,
        stats: null,
        loading: true,
        error: null,
        pagination: null,
        total: 0,
      };
      
      const error = 'Error fetching transactions';
      const action = { 
        type: 'transactions/fetchTransactions/rejected',
        payload: error
      };
      
      const newState = transactionReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('actions', () => {
    let store;

    beforeEach(() => {
      store = mockStore({
        transactions: {
          transactions: [],
          currentTransaction: null,
          loading: false,
          error: null,
          pagination: {
            page: 1,
            limit: 10
          },
          total: 0
        }
      });
    });

    test('fetchTransactions 应该创建正确的 action', () => {
      // 模拟 API 响应
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          transactions: [{ _id: '1', amount: 100 }],
          pagination: { page: 1, limit: 10 },
          total: 1
        })
      });

      const expectedActions = [
        { type: fetchTransactions.pending.type },
        {
          type: fetchTransactions.fulfilled.type,
          payload: {
            transactions: [{ _id: '1', amount: 100 }],
            pagination: { page: 1, limit: 10 },
            total: 1
          }
        }
      ];

      return store.dispatch(fetchTransactions({ bookId: '1' })).then(() => {
        const actions = store.getActions();
        expect(actions[0].type).toBe(expectedActions[0].type);
        expect(actions[1].type).toBe(expectedActions[1].type);
        expect(actions[1].payload).toEqual(expectedActions[1].payload);
      });
    });

    test('createTransaction 应该创建正确的 action', () => {
      const newTransaction = { amount: 100, type: 'expense' };
      
      // 模拟 API 响应
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          transaction: { _id: '1', ...newTransaction }
        })
      });

      const expectedActions = [
        { type: createTransaction.pending.type },
        {
          type: createTransaction.fulfilled.type,
          payload: { _id: '1', ...newTransaction }
        }
      ];

      return store.dispatch(createTransaction(newTransaction)).then(() => {
        const actions = store.getActions();
        expect(actions[0].type).toBe(expectedActions[0].type);
        expect(actions[1].type).toBe(expectedActions[1].type);
        expect(actions[1].payload).toEqual(expectedActions[1].payload);
      });
    });
  });
});