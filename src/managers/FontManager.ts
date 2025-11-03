// FontManager
//
// The static class that loads font files.

import { Utils } from "../core/index.js";

export class FontManager {
	static _urls = {};
	static _states = {};

	constructor() {
		throw new Error("This is a static class");
	}

	static load(family, filename) {
		if (FontManager._states[family] !== "loaded") {
			if (filename) {
				const url = FontManager.makeUrl(filename);
				FontManager.startLoading(family, url);
			} else {
				FontManager._urls[family] = "";
				FontManager._states[family] = "loaded";
			}
		}
	}

	static isReady() {
		for (const family in FontManager._states) {
			const state = FontManager._states[family];
			if (state === "loading") {
				return false;
			}
			if (state === "error") {
				FontManager.throwLoadError(family);
			}
		}
		return true;
	}

	static startLoading(family, url) {
		const source = "url(" + url + ")";
		const font = new FontFace(family, source);
		FontManager._urls[family] = url;
		FontManager._states[family] = "loading";
		font
			.load()
			.then(() => {
				document.fonts.add(font);
				FontManager._states[family] = "loaded";
				return 0;
			})
			.catch(() => {
				FontManager._states[family] = "error";
			});
	}

	static throwLoadError(family) {
		const url = FontManager._urls[family];
		const retry = () => FontManager.startLoading(family, url);
		throw ["LoadError", url, retry];
	}

	static makeUrl(filename) {
		return "assets/fonts/" + Utils.encodeURI(filename);
	}
}
