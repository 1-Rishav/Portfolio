const js = require('@eslint/js')
const globals = require('globals')

// Mirrors client/eslint.config.js's structure and versions, adapted for a
// Node/CommonJS backend instead of a browser/React frontend: Node globals
// (process, require, __dirname, ...) instead of browser ones, and no
// React-specific plugins since there's no JSX here.
module.exports = [
  { ignores: ['node_modules'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
]
