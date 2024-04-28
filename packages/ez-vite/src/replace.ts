import {PluginObj, PluginTarget, types as t} from '@babel/core';

function ReplacePlugin(functionName: string, moduleName: string): PluginTarget {
    return (api) => {
        const plugin: PluginObj = {
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
                            if ((importPath.node.imported as { name: string })?.name === functionName) {
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
                    if (!hasModuleNameImport) {
                        const jsxExportStatement = api.template.statement.ast(`import { ${functionName} } from '${moduleName}';`);
                        path.node.body.push(jsxExportStatement);
                    }
                },
                JSXExpressionContainer(path) {
                    const {expression} = path.node;
                    // 检查是否是一个标识符，比如 {foo}
                    if (expression.type !== 'JSXEmptyExpression') {
                        // 替换为指定的函数调用
                        path.node.expression = t.callExpression(
                            t.identifier(functionName),
                            [t.arrowFunctionExpression([], expression)]
                        );
                    }
                },
            }
        }
        return plugin
    }
}

export default ReplacePlugin