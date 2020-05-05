module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: '3',
        useBuiltIns: 'usage',
        modules: false
      }
    ]
  ],
  plugins: [
    'babel-plugin-transform-es2015-modules-commonjs',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-async-to-generator',
  ],
  comments: false,
}
