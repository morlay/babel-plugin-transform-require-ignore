import { expect } from 'chai';
import * as babel from 'babel-core';

function trimLines(str) {
  return str.replace(/^\n+|\n+$/, '').replace(/\n+/g, '\n');
}

export default function babelEql(codeString, babelOptions = {}) {
  const code = babel.transform(codeString, babelOptions).code;
  return {
    eql: (expectCode, expectCodeBabelOptions = {}) => {
      return expect(trimLines(code)).to.eql(trimLines(babel.transform(expectCode, expectCodeBabelOptions).code));
    }
  };
}
