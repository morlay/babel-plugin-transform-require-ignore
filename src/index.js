import path from 'path';

export default function () {
  function extFix(ext) {
    return ext.charAt(0) === '.' ? ext : ('.' + ext);
  }

  return {
    visitor: {
      CallExpression: {
        enter(nodePath, { opts }) {
          const extensionsInput = [].concat(opts.extensions || []);
          if (extensionsInput.length === 0) {
            return;
          }
          const extensions = extensionsInput.map(extFix);
          const callee = nodePath.get('callee');

          if (callee.isIdentifier() && callee.equals('name', 'require')) {
            const arg = nodePath.get('arguments')[0];
            if (arg && arg.isStringLiteral() && extensions.indexOf(path.extname(arg.node.value)) > -1) {
              if (nodePath.parentPath.isVariableDeclarator()) {
                throw new Error(`${arg.node.value} should not be assign to variable.`);
              } else {
                nodePath.remove();
              }
            }
          }
        }
      },

      ImportDeclaration: {
        enter(nodePath, { opts }) {
          const extensionsInput = [].concat(opts.extensions || []);

          if (extensionsInput.length === 0) {
            return;
          }
          const extensions = extensionsInput.map(extFix);

          if (extensions.indexOf(path.extname(nodePath.node.source.value)) > -1) {
            const specifiers = nodePath.get('specifiers');

            if (specifiers.length) {
              const specifier = specifiers[specifiers.length - 1];

              if (specifier.isImportDefaultSpecifier()) {
                throw new Error(`${nodePath.node.source.value} should not be imported using default imports.`);
              }
              if (specifier.isImportSpecifier()) {
                throw new Error(`${nodePath.node.source.value} should not be imported using named imports.`);
              }
              if (specifier.isImportNamespaceSpecifier()) {
                throw new Error(`${nodePath.node.source.value} should not be imported using namespace imports.`);
              }
            }

            nodePath.remove();
          }
        }
      }
    }
  };
}
