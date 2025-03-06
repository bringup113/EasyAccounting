import { rest } from 'msw';
import { mockBooks, mockAccounts, mockTransactions, mockCategories, mockTags, mockPersons } from './mockData';

// API 基础 URL
const baseUrl = 'http://localhost:5001/api';

export const handlers = [
  // 用户认证
  rest.post(`${baseUrl}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            _id: 'user-1',
            name: '测试用户',
            email: 'test@example.com'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: '邮箱或密码不正确' })
    );
  }),
  
  // 获取账本
  rest.get('/api/books/:bookId', (req, res, ctx) => {
    const { bookId } = req.params;
    const book = mockBooks.find(b => b.id === bookId);
    
    if (!book) {
      return res(
        ctx.status(404),
        ctx.json({ message: '账本未找到' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({ book })
    );
  }),
  
  // 获取账户列表
  rest.get('/api/accounts', (req, res, ctx) => {
    const bookId = req.url.searchParams.get('bookId');
    let accounts = mockAccounts;
    
    if (bookId) {
      accounts = accounts.filter(account => account.bookId === bookId);
    }
    
    return res(
      ctx.status(200),
      ctx.json({ accounts })
    );
  }),
  
  // 获取交易记录列表
  rest.get('/api/transactions', (req, res, ctx) => {
    const bookId = req.url.searchParams.get('bookId');
    const limit = req.url.searchParams.get('limit') || 10;
    const startDate = req.url.searchParams.get('startDate');
    const endDate = req.url.searchParams.get('endDate');
    
    let transactions = mockTransactions;
    
    if (bookId) {
      transactions = transactions.filter(transaction => transaction.bookId === bookId);
    }
    
    if (startDate && endDate) {
      transactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      });
    }
    
    return res(
      ctx.status(200),
      ctx.json({ 
        transactions: transactions.slice(0, parseInt(limit)),
        total: transactions.length
      })
    );
  }),
  
  // 获取类别列表
  rest.get('/api/categories', (req, res, ctx) => {
    const bookId = req.url.searchParams.get('bookId');
    let categories = mockCategories;
    
    if (bookId) {
      categories = categories.filter(category => category.bookId === bookId);
    }
    
    return res(
      ctx.status(200),
      ctx.json({ categories })
    );
  }),
  
  // 获取标签列表
  rest.get('/api/tags', (req, res, ctx) => {
    const bookId = req.url.searchParams.get('bookId');
    let tags = mockTags;
    
    if (bookId) {
      tags = tags.filter(tag => tag.bookId === bookId);
    }
    
    return res(
      ctx.status(200),
      ctx.json({ tags })
    );
  }),
  
  // 获取人员列表
  rest.get('/api/persons', (req, res, ctx) => {
    const bookId = req.url.searchParams.get('bookId');
    let persons = mockPersons;
    
    if (bookId) {
      persons = persons.filter(person => person.bookId === bookId);
    }
    
    return res(
      ctx.status(200),
      ctx.json({ persons })
    );
  })
]; 