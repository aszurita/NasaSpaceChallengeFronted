// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const mockAxiosInstance = {
	post: jest.fn(),
	get: jest.fn(),
	interceptors: {
		request: { use: jest.fn() },
		response: { use: jest.fn() },
	},
};

jest.mock('axios', () => ({
	__esModule: true,
	default: {
		create: jest.fn(() => mockAxiosInstance),
	},
}));
