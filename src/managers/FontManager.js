// FontManager
//
// The static class that loads font files.

import { Utils } from "../core/Utils.js";

export class FontManager {
	static _urls = {};
	static _states = {};

	constructor() {
		throw new Error("This is a static class");
	}

	static load(family, filename) {
		if (this._states[family] !== "loaded") {
			if (filename) {
				const url = this.makeUrl(filename);
				this.startLoading(family, url);
			} else {
				this._urls[family] = "";
				this._states[family] = "loaded";
			}
		}
	}

	static isReady() {
		for (const family in this._states) {
			const state = this._states[family];
			if (state === "loading") {
				return false;
			}
			if (state === "error") {
				this.throwLoadError(family);
			}
		}
		return true;
	}

	static startLoading(family, url) {
		const source = "url(" + url + ")";
		const font = new FontFace(family, source);
		this._urls[family] = url;
		this._states[family] = "loading";
		font.load()
			.then(() => {
				document.fonts.add(font);
				this._states[family] = "loaded";
				return 0;
			})
			.catch(() => {
				this._states[family] = "error";
			});
	}

	static throwLoadError(family) {
		const url = this._urls[family];
		const retry = () => this.startLoading(family, url);
		throw ["LoadError", url, retry];
	}

	static makeUrl(filename) {
		return "assets/fonts/" + Utils.encodeURI(filename);
	}
}
