import {createFilter} from 'vite';
import {types as t,} from '@babel/core';

function ReplacePlugin(functionName, moduleName) {
    return (api) => {
        return {
            visitor: {
                Program(path) {
                    let hasJSX = false;
                    let hasCreateSignalImport = false;
                    let hasModuleNameImport = false
                    // 检查是否存在 JSX
                    path.traverse({
                        JSXElement() {
                            hasJSX = true;
                        },
                        JSXFragment() {
                            hasJSX = true;
                        }
                    });
                    if (!hasJSX) {
                        return;
                    }
                    // 检查是否已导入 createSignal
                    path.traverse({
                        ImportSpecifier(importPath) {
                            if (importPath.node.imported.name === functionName) {
                                hasCreateSignalImport = true;
                            }
                        }
                    });
                    // 如果没有导入 createSignal 且需要添加，则找到已有的导入语句并添加 createSignal
                    if (!hasCreateSignalImport) {
                        path.traverse({
                            ImportDeclaration(importPath) {
                                if (importPath.node.source.value === moduleName) {
                                    hasModuleNameImport = true;
                                    const createSignalSpecifier = api.types.importSpecifier(
                                        api.types.identifier(functionName),
                                        api.types.identifier(functionName)
                                    );
                                    importPath.node.specifiers.unshift(createSignalSpecifier);
                                }
                            }
                        });
                    }
                    if(!hasModuleNameImport){
                        const jsxExportStatement = api.template.statement.ast(`import { ${functionName} } from '${moduleName}';`);
                        path.node.body.push(jsxExportStatement);
                    }
                },
                JSXExpressionContainer(path) {
                    const {expression} = path.node;
                    // 检查是否是一个标识符，比如 {foo}
                    if (expression.type !== 'JSXEmptyExpression') {
                        console.log('expression', expression);
                        // 替换为指定的函数调用
                        path.node.expression = t.callExpression(
                            t.identifier(functionName),
                            [t.arrowFunctionExpression([], expression)]
                        );
                    }
                },
            }
        }
    }
}

let babel;

async function loadBabel() {
    if (!babel) {
        babel = await import('@babel/core');
    }
    return babel;
}

const defaultIncludeRE = /\.[tj]sx?$/;
const tsRE = /\.tsx?$/;

function transform(opts = {include: undefined, exclude: undefined}) {
    const filter = createFilter(opts.include ?? defaultIncludeRE, opts.exclude);
    let projectRoot = process.cwd();
    return {
        name: "transform-jsx",
        enforce: 'pre',
        //apply: "serve",
        configResolved(config) {
            projectRoot = config.root;
        },
        transform: async (code, id) => {

            const babelOptions = {
                parserOpts: {}
            };

            const plugins = [
                ReplacePlugin('createSignal', 'ez'),
            ]


            if (id.includes("/node_modules/"))
                return;
            const [filepath] = id.split("?");
            if (!filter(filepath))
                return;

            const parserPlugins = [];
            if (!filepath.endsWith(".ts")) {
                parserPlugins.push("jsx");
            }
            if (tsRE.test(filepath)) {
                parserPlugins.push("typescript");
            }
            const babel2 = await loadBabel();
            const result = await babel2.transformAsync(code, {
                root: projectRoot,
                filename: id,
                sourceFileName: filepath,
                retainLines: true,
                parserOpts: {
                    ...babelOptions.parserOpts,
                    sourceType: "module",
                    allowAwaitOutsideFunction: true,
                    plugins: parserPlugins
                },
                plugins,
                sourceMaps: true
            });
            if (result) {
                const code2 = result.code;
                return {code: code2, map: result.map};
            }
        }
    }
}

export default transform
export {
    transform as ez
}
