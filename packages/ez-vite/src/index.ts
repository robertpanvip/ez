import {Plugin, createFilter} from 'vite'
import {PluginItem} from "@babel/core";
import ReplacePlugin from "./replace";

let babel:any;

async function loadBabel() {
    if (!babel) {
        babel = await import('@babel/core');
    }
    return babel;
}

const defaultIncludeRE = /\.[tj]sx?$/;
const tsRE = /\.tsx?$/;

function transform(opts = {include: undefined, exclude: undefined}): Plugin {
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

            const plugins:PluginItem[] = [
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
