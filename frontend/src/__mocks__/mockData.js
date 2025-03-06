// 模拟账本数据
export const mockBooks = [
  {
    id: 'book-1',
    name: '个人账本',
    description: '我的个人财务记录',
    defaultCurrency: 'CNY',
    timezone: 'Asia/Shanghai',
    currencies: ['CNY', 'USD'],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'book-2',
    name: '家庭账本',
    description: '家庭共享财务记录',
    defaultCurrency: 'CNY',
    timezone: 'Asia/Shanghai',
    currencies: ['CNY', 'USD', 'EUR'],
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z'
  }
];

// 模拟账户数据
export const mockAccounts = [
  {
    id: 'account-1',
    name: '现金',
    initialBalance: 1000,
    currency: 'CNY',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'account-2',
    name: '银行卡',
    initialBalance: 5000,
    currency: 'CNY',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'account-3',
    name: '支付宝',
    initialBalance: 2000,
    currency: 'CNY',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'account-4',
    name: '微信',
    initialBalance: 1500,
    currency: 'CNY',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
];

// 模拟类别数据
export const mockCategories = [
  {
    id: 'category-1',
    name: '餐饮',
    type: 'expense',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'category-2',
    name: '交通',
    type: 'expense',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'category-3',
    name: '工资',
    type: 'income',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'category-4',
    name: '奖金',
    type: 'income',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'category-5',
    name: '转账',
    type: 'transfer',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
];

// 模拟标签数据
export const mockTags = [
  {
    id: 'tag-1',
    name: '必要',
    color: '#ff4d4f',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'tag-2',
    name: '娱乐',
    color: '#1890ff',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'tag-3',
    name: '投资',
    color: '#52c41a',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
];

// 模拟人员数据
export const mockPersons = [
  {
    id: 'person-1',
    name: '张三',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'person-2',
    name: '李四',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'person-3',
    name: '王五',
    bookId: 'book-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
];

// 模拟交易记录数据
export const mockTransactions = [
  {
    id: 'transaction-1',
    type: 'expense',
    amount: 100,
    accountId: 'account-1',
    categoryId: 'category-1',
    description: '午餐',
    date: '2023-01-01T12:00:00.000Z',
    personIds: ['person-1'],
    tagIds: ['tag-1'],
    bookId: 'book-1',
    createdAt: '2023-01-01T12:00:00.000Z',
    updatedAt: '2023-01-01T12:00:00.000Z'
  },
  {
    id: 'transaction-2',
    type: 'expense',
    amount: 50,
    accountId: 'account-2',
    categoryId: 'category-2',
    description: '打车',
    date: '2023-01-02T12:00:00.000Z',
    personIds: ['person-1'],
    tagIds: ['tag-1'],
    bookId: 'book-1',
    createdAt: '2023-01-02T12:00:00.000Z',
    updatedAt: '2023-01-02T12:00:00.000Z'
  },
  {
    id: 'transaction-3',
    type: 'income',
    amount: 5000,
    accountId: 'account-2',
    categoryId: 'category-3',
    description: '工资',
    date: '2023-01-10T12:00:00.000Z',
    personIds: [],
    tagIds: [],
    bookId: 'book-1',
    createdAt: '2023-01-10T12:00:00.000Z',
    updatedAt: '2023-01-10T12:00:00.000Z'
  },
  {
    id: 'transaction-4',
    type: 'transfer',
    amount: 1000,
    accountId: 'account-2',
    toAccountId: 'account-3',
    categoryId: 'category-5',
    description: '转账',
    date: '2023-01-15T12:00:00.000Z',
    personIds: [],
    tagIds: [],
    bookId: 'book-1',
    createdAt: '2023-01-15T12:00:00.000Z',
    updatedAt: '2023-01-15T12:00:00.000Z'
  },
  {
    id: 'transaction-5',
    type: 'expense',
    amount: 200,
    accountId: 'account-3',
    categoryId: 'category-1',
    description: '晚餐',
    date: '2023-01-20T18:00:00.000Z',
    personIds: ['person-1', 'person-2'],
    tagIds: ['tag-1', 'tag-2'],
    bookId: 'book-1',
    createdAt: '2023-01-20T18:00:00.000Z',
    updatedAt: '2023-01-20T18:00:00.000Z'
  }
]; 