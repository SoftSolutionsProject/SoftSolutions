/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  coverageDirectory:"coverage", //diretorio dos rlelatórios de cobertura
  coverageReporters:["html","text","lcov", "json"], // formatos d eexportação dos relatórios
  collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/*d.ts!"], //regras para inclusão de scripts no html
  coverageThreshold: {
    global: {
        branches: 80,
        functions: 82,
        lines: 87,
        statements: 81.5
    }
}

};