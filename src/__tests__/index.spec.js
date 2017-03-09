import { expect } from 'chai';
import babelEql from './helpers/babelEql';
import babelPluginTransformRequireIgnore from '../.';

describe(__filename, () => {
  context('single use', () => {
    it('should remove require call expression by extensions', () => {
      babelEql(`
        require('./index.less');
        require('./index.sass');
        require('babel');
      `, {
        plugins: [
          [
            babelPluginTransformRequireIgnore,
            {
              extensions: ['.less', 'sass']
            }
          ]
        ]
      }).eql(`
      require('babel');
      `);
    });

    it('should remove import call expression by extensions', () => {
      babelEql(`
        import './index.less';
        import * as babel from 'babel';
      `, {
        plugins: [
          [
            babelPluginTransformRequireIgnore,
            {
              extensions: ['.less', '.sass']
            }
          ]
        ]
      }).eql(`
        import * as babel from 'babel';
      `);
    });

    it('should not process when remove require call expression in assignment expression', () => {
      expect(() => {
        const source = `
          var { a } = require('./index.less');
          require('babel');
        `;
        babelEql(source, {
          plugins: [
            [
              babelPluginTransformRequireIgnore,
              {
                extensions: ['.less']
              }
            ]
          ]
        });
      }).to.throw('./index.less should not be assign to variable.');
    });

    it('should not process when remove import expression in default imports', () => {
      expect(() => {
        const source = `
          import myCss from './index.less';
          import * as babel from 'babel';
        `;
        babelEql(source, {
          plugins: [
            [
              babelPluginTransformRequireIgnore,
              {
                extensions: ['.less']
              }
            ]
          ]
        });
      }).to.throw('./index.less should not be imported using default imports.');
    });

    it('should not process when remove import expression in named imports', () => {
      expect(() => {
        const source = `
          import { myCss } from './index.less';
          import * as babel from 'babel';
        `;
        babelEql(source, {
          plugins: [
            [
              babelPluginTransformRequireIgnore,
              {
                extensions: ['.less']
              }
            ]
          ]
        });
      }).to.throw('./index.less should not be imported using named imports.');
    });

    it('should not process when remove import expression in namespace imports', () => {
      expect(() => {
        const source = `
          import * as myCss from './index.less';
          import * as babel from 'babel';
        `;
        babelEql(source, {
          plugins: [
            [
              babelPluginTransformRequireIgnore,
              {
                extensions: ['.less']
              }
            ]
          ]
        });
      }).to.throw('./index.less should not be imported using namespace imports.');
    });

    it('should remove require call expression in other block', () => {
      babelEql(`
        (function (){
           require('./index.sass');
           require('./index.less');
           require('babel');
        })();
      `, {
        plugins: [
          [
            babelPluginTransformRequireIgnore,
            {
              extensions: ['.less', '.sass']
            }
          ]
        ]
      }).eql(`
       (function (){
          require('babel');
        })();
      `);
    });
  });

  context('with babel-preset-es2015', () => {
    it('should remove require call expression', () => {
      babelEql(`
        require('./index.sass');
        require('babel');
      `, {
        presets: [
          'es2015'
        ],
        plugins: [
          [
            babelPluginTransformRequireIgnore,
            {
              extensions: ['.less', '.sass']
            }
          ]
        ]
      }).eql(`
        require('babel');
      `, {
        presets: [
          'es2015'
        ]
      });
    });

    it('should remove require call expression after import transformed', () => {
      babelEql(`
        import './index.less';
        import * as babel from 'babel';
      `, {
        presets: [
          'es2015'
        ],
        plugins: [
          [
            babelPluginTransformRequireIgnore,
            {
              extensions: ['.less', '.sass']
            }
          ]
        ]
      }).eql(`
        import * as babel from 'babel';
      `, {
        presets: [
          'es2015'
        ]
      });
    });
  });
});
