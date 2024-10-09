export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const roots = ['<rootDir>/src'];
export const testRegex = '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]s$';
export const moduleFileExtensions = ['ts', 'js', 'json', 'node'];
export const coverageDirectory = '<rootDir>/coverage';
export const collectCoverageFrom = ['src/**/*.{ts,js}', '!src/index.ts'];
