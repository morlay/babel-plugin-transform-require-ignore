import path from 'path';

export default function () {
  function extFix(ext) {
    return ext.charAt(0) === '.' ? ext : ('.' + ext);
  }

  function findParentExpressionStatement(nodePath) {
    if (nodePath.isExpressionStatement() || nodePath.isVariableDeclaration()) {
      return nodePath;
    }
    return findParentExpressionStatement(nodePath.parentPath);
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
            if (arg && arg.isStringLiteral()) {
              if (extensions.indexOf(path.extname(arg.node.value)) > -1) {
                findParentExpressionStatement(nodePath).remove();
              }
            }
          }
        }
      }
    }
  };
}
