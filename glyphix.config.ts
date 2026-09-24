import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import fs from 'fs';
import { execSync } from 'child_process';
import manifest from './src/manifest.json';

type CleanConsoleOptions = {
  levels: string[];
};

const cleanConsolePlugin = (options: CleanConsoleOptions) => {
  const levels = new Set(options.levels);

  const getConsoleMethod = (
    callee: t.Expression | t.V8IntrinsicIdentifier,
  ): string | null => {
    if (t.isMemberExpression(callee) || t.isOptionalMemberExpression(callee)) {
      if (!t.isIdentifier(callee.object, { name: 'console' })) {
        return null;
      }

      if (!callee.computed && t.isIdentifier(callee.property)) {
        return callee.property.name;
      }

      if (callee.computed && t.isStringLiteral(callee.property)) {
        return callee.property.value;
      }
    }
    return null;
  };

  return {
    name: 'clean-console',
    setup(build: any) {
      build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async (args: any) => {
        const source = fs.readFileSync(args.path, 'utf8');
        const ast = parse(source, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });

        traverse(ast as any, {
          CallExpression(path) {
            if (path.scope.hasBinding('console')) {
              return;
            }

            const method = getConsoleMethod(path.node.callee);
            if (!method || !levels.has(method)) {
              return;
            }

            if (path.parentPath.isExpressionStatement()) {
              path.parentPath.remove();
            } else {
              path.replaceWith(t.unaryExpression('void', t.numericLiteral(0)));
            }
          },
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const output = generate(ast, { sourceMaps: true });
        return {
          contents: output.code,
          loader: 'ts',
        };
      });
    },
  };
};

const logLevels = ['trace', 'debug', 'info', 'warn', 'error'];

const removeLogLevels = (function () {
  const index = logLevels.findIndex(
    (item) => item === process.env.GLYPHIX_DEBUG,
  );
  if (index < 0) return [];

  return logLevels.slice(0, index);
})();

function getGitVersion() {
  return execSync('git rev-parse --short HEAD ').toString().trim();
}

module.exports = {
  define: {
    'process.env.GLYPHIX_APP_VERSION': `"${manifest.versionName}"`,
    'process.env.GLYPHIX_APP_HASH': `"${getGitVersion()}"`,
    'process.env.GLYPHIX_TEXT_VERSION': `${new Date().getMinutes()}`,
  },
  plugins: [cleanConsolePlugin({ levels: removeLogLevels })],
};
