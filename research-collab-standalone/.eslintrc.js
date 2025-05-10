module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Relax rules for easier development
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off'
  }
};
