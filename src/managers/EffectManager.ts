// EffectManager
//
// The static class that loads Effekseer effects.

import { Graphics, Utils } from "../core/index.js";

export class EffectManager {
	static _cache = {};
	static _errorUrls = [];

	constructor() {
		throw new Error("This is a static class");
	}

	static load(filename) {
		if (filename) {
			const url = EffectManager.makeUrl(filename);
			const cache = EffectManager._cache;
			if (!cache[url] && Graphics.effekseer) {
				EffectManager.startLoading(url);
			}
			return cache[url];
		} else {
			return null;
		}
	}

	static startLoading(url) {
		const onLoad = () => EffectManager.onLoad(url);
		const onError = (message, url) => EffectManager.onError(url);
		const effect = Graphics.effekseer.loadEffect(url, 1, onLoad, onError);
		EffectManager._cache[url] = effect;
		return effect;
	}

	static clear() {
		for (const url in EffectManager._cache) {
			const effect = EffectManager._cache[url];
			Graphics.effekseer.releaseEffect(effect);
		}
		EffectManager._cache = {};
	}

	static onLoad() /*url*/ {
		//
	}

	static onError(url) {
		EffectManager._errorUrls.push(url);
	}

	static makeUrl(filename) {
		return "assets/effects/" + Utils.encodeURI(filename) + ".efkefc";
	}

	static checkErrors() {
		const url = EffectManager._errorUrls.shift();
		if (url) {
			EffectManager.throwLoadError(url);
		}
	}

	static throwLoadError(url) {
		const retry = () => EffectManager.startLoading(url);
		throw ["LoadError", url, retry];
	}

	static isReady() {
		EffectManager.checkErrors();
		for (const url in EffectManager._cache) {
			const effect = EffectManager._cache[url];
			if (!effect.isLoaded) {
				return false;
			}
		}
		return true;
	}
}
