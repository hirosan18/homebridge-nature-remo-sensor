module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    node: true
  },
  extends: [
    'standard'
  ],
  rules: {
    'arrow-parens': 'off', // allow paren-less arrow functions
    'generator-star-spacing': 'off', // allow async-await
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-multi-spaces': ['error', { ignoreEOLComments: true, exceptions: { VariableDeclarator: true } }],
    'no-var': 'error',
    'operator-linebreak': ['error', 'after']
  },
  globals: {
  }
}
