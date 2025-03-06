// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 已弃用
    removeListener: jest.fn(), // 已弃用
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 修复 JSDOM 中 NodeList.prototype.includes 不存在的问题
if (!NodeList.prototype.includes) {
  NodeList.prototype.includes = Array.prototype.includes;
}

// 模拟 ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟 IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.IntersectionObserver = IntersectionObserverMock;

// 模拟 window.scrollTo
window.scrollTo = jest.fn();

// 模拟 document.createRange
document.createRange = () => {
  const range = new Range();
  range.getBoundingClientRect = jest.fn();
  range.getClientRects = jest.fn(() => ({
    item: () => null,
    length: 0,
  }));
  return range;
};

// 模拟 Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// 模拟 HTMLElement.prototype.offsetHeight 和 offsetWidth
Object.defineProperties(HTMLElement.prototype, {
  offsetHeight: {
    get() { return 100; }
  },
  offsetWidth: {
    get() { return 100; }
  }
});

// 设置服务器
const { server } = require('./__mocks__/server');

// 在所有测试之前启动服务器
beforeAll(() => server.listen());

// 每个测试后重置处理程序
afterEach(() => server.resetHandlers());

// 在所有测试之后关闭服务器
afterAll(() => server.close());

// 模拟 localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
}); 