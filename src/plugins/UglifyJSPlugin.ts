import { Plugin } from "../WorkflowContext";
import { BundleSource } from '../BundleSource';



/**
 * @export
 * @class UglifyJSPluginClass
 * @implements {Plugin}
 */
export class UglifyJSPluginClass implements Plugin {
	/**
	 * @type {any}
	 * @memberOf UglifyJSPluginClass
	 */
	public options: any;

	constructor(options: any) {
		this.options = options || {};
	}

	public postBundle(context) {
		const mainOptions: any = {
			fromString: true
		};
		const UglifyJs = require("uglify-js");


		const concat = context.source.getResult();
		const source = concat.content.toString();
		const sourceMap = concat.sourceMap;

		const newSource = new BundleSource(context);
		context.source = newSource;

		const newConcat = context.source.getResult();

		if ("sourceMapConfig" in context) {
			if (context.sourceMapConfig.bundleReference) {
				mainOptions.inSourceMap = JSON.parse(sourceMap);
				mainOptions.outSourceMap = context.sourceMapConfig.bundleReference;
			}
		}

		const result = UglifyJs.minify(source, {
			...this.options,
			...mainOptions
		});

		newConcat.add(null, result.code, result.map || sourceMap);
	}
}

export const UglifyJSPlugin = (options: any) => {
	return new UglifyJSPluginClass(options);
}