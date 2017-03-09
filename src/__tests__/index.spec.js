import { test } from 'ava';
import * as babel from 'babel-core';
import babelPluginTransformRequireIgnore from '../.';

function trimLines(str) {
  return str.replace(/^\n+|\n+$/, '').replace(/\n+/g, '\n');
}

const babelAssign = (babelOptions = {}) => (t, expected, input) => {
  const code = babel.transform(input, babelOptions).code;
  t.is(trimLines(code), trimLines(babel.transform(expected, babelOptions).code));
};

const babelThrow = (babelOptions = {}) => (t, input, msg) => {
  const error = t.throws((() => {
    babel.transform(input, babelOptions);
  }));
  t.true(error.toString().includes(msg));
};

const simpleBabelAssign = babelAssign({
  plugins: [
    [
      babelPluginTransformRequireIgnore,
      {
        extensions: ['.less', 'sass'],
      },
    ],
  ],
});

const withES2015BabelAssign = babelAssign({
  presets: [
    'es2015',
  ],
  plugins: [
    [
      babelPluginTransformRequireIgnore,
      {
        extensions: ['.less', 'sass'],
      },
    ],
  ],
});

const simpleBabelThrow = babelThrow({
  plugins: [
    [
      babelPluginTransformRequireIgnore,
      {
        extensions: ['.less', 'sass'],
      },
    ],
  ],
});

test('should remove require call expression by extensions', simpleBabelAssign, `
require('babel');
`, `
require('./index.less');
require('./index.sass');
require('babel');
`);

test('should remove import call expression by extensions', simpleBabelAssign, `
import './index.less';
import * as babel from 'babel';`, `
import * as babel from 'babel';
`);

test('should not process when remove require call expression in assignment expression', simpleBabelThrow, `
var { a } = require('./index.less');
require('babel');
`, './index.less should not be assign to variable.');

test('should not process when remove import expression in default imports', simpleBabelThrow, `
import myCss from './index.less';
import * as babel from 'babel';
`, './index.less should not be imported using default imports.');

test('should not process when remove import expression in named imports', simpleBabelThrow, `
import { myCss } from './index.less';
import * as babel from 'babel';
`, './index.less should not be imported using named imports.');

test('should not process when remove import expression in namespace imports', simpleBabelThrow, `
import * as myCss from './index.less';
import * as babel from 'babel';
`, './index.less should not be imported using namespace imports.');

test('should remove require call expression in other block', simpleBabelAssign, `
(function (){
  require('./index.sass');
  require('./index.less');
  require('babel');
})();
`, `
(function (){
  require('babel');
})();
`);

test('should remove require call expression', withES2015BabelAssign, `
  require('./index.sass');
  require('babel');
`, `
  require('babel');
`);

test('should remove require call expression after import transformed', withES2015BabelAssign, `
  import './index.less';
  import * as babel from 'babel';
`, `
  import * as babel from 'babel';
`);
