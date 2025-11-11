/** @type {import('jest').Config} */
const config = {
  // Indicates that each test file should be executed in its own environment
  testEnvironment: "node",

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // A map from regular expressions to paths to transformers
  // We need this to use ES Modules with Jest
  transform: {
    "^.+\.js$": "babel-jest",
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ["/node_modules/"],

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ["json", "text", "lcov", "clover"],
};

export default config;
