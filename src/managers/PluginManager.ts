// PluginManager
//
// The static class that manages the plugins.

import { Utils } from "../core/index.js";

export class PluginManager {
	static _scripts = [];
	static _errorUrls = [];
	static _parameters = {};
	static _commands = {};

	constructor() {
		throw new Error("This is a static class");
	}

	static setup(plugins) {
		for (const plugin of plugins) {
			const pluginName = Utils.extractFileName(plugin.name);
			if (plugin.status && !PluginManager._scripts.includes(pluginName)) {
				PluginManager.setParameters(pluginName, plugin.parameters);
				PluginManager.loadScript(plugin.name);
				PluginManager._scripts.push(pluginName);
			}
		}
	}

	static parameters(name) {
		return PluginManager._parameters[name.toLowerCase()] || {};
	}

	static setParameters(name, parameters) {
		PluginManager._parameters[name.toLowerCase()] = parameters;
	}

	static loadScript(filename) {
		const url = PluginManager.makeUrl(filename);
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url;
		script.async = false;
		script.defer = true;
		script.onerror = PluginManager.onError.bind(PluginManager);
		script._url = url;
		document.body.appendChild(script);
	}

	static onError(e) {
		PluginManager._errorUrls.push(e.target._url);
	}

	static makeUrl(filename) {
		return "js/plugins/" + Utils.encodeURI(filename) + ".js";
	}

	static checkErrors() {
		const url = PluginManager._errorUrls.shift();
		if (url) {
			PluginManager.throwLoadError(url);
		}
	}

	static throwLoadError(url) {
		throw new Error("Failed to load: " + url);
	}

	static registerCommand(pluginName, commandName, func) {
		const key = pluginName + ":" + commandName;
		PluginManager._commands[key] = func;
	}

	static callCommand(self, pluginName, commandName, args) {
		const key = pluginName + ":" + commandName;
		const func = PluginManager._commands[key];
		if (typeof func === "function") {
			func.bind(self)(args);
		}
	}
}
