export default {
    testEnvironment: "node",

    // Use native Node.js ES modules without Babel.
    transform: {},

    testMatch: ["<rootDir>/tests/**/*.test.js"],

    setupFiles: ["<rootDir>/tests/setupEnv.js"],

    setupFilesAfterEnv: ["<rootDir>/tests/setupAfterEnv.js"],

    clearMocks: true,
    restoreMocks: true,

    testTimeout: 15000,
};
