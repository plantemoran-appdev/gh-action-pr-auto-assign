// **********************************************************************
// * Prettier configuration
// ` https://prettier.io/docs/en/options.html
// **********************************************************************

module.exports = {
  // * have prettier wrap at 120 chars
  printWidth: 120,

  // * set tab width to 2 spaces
  tabWidth: 2,

  // * use spaces
  useTabs: false,

  // * add semicolons
  semi: true,

  // * use single quotes
  singleQuote: true,

  // * only add quotes around object properties where required
  quoteProps: 'as-needed',

  // * no trailing commas
  trailingComma: 'none',

  // * print spaces between brackets in object literals
  bracketSpacing: true,

  // * always include arrow parens
  arrowParens: 'always',

  // * preserve prose wrapping
  proseWrap: 'preserve',

  // * whitespace is considered insensitive
  htmlWhitespaceSensitivity: 'ignore',

  // * use crlf for end-of-line
  endOfLine: 'crlf'
};
