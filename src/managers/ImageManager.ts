// ImageManager
//
// The static class that loads images, creates bitmap objects and retains them.

import { Bitmap, Utils } from "../core/index.js";
import { DataManager } from "../managers/index.js";

export class ImageManager {
	static standardIconWidth = 32;
	static standardIconHeight = 32;
	static standardFaceWidth = 144;
	static standardFaceHeight = 144;

	static _cache = {};
	static _system = {};
	static _emptyBitmap = new Bitmap(1, 1);

	constructor() {
		throw new Error("This is a static class");
	}

	static get iconWidth() {
		return ImageManager.getIconSize();
	}

	static get iconHeight() {
		return ImageManager.getIconSize();
	}

	static get faceWidth() {
		return ImageManager.getFaceSize();
	}

	static get faceHeight() {
		return ImageManager.getFaceSize();
	}

	static getIconSize() {
		if ("iconSize" in DataManager.$dataSystem) {
			return DataManager.$dataSystem.iconSize;
		} else {
			return ImageManager.defaultIconWidth;
		}
	}

	static getFaceSize() {
		if ("faceSize" in DataManager.$dataSystem) {
			return DataManager.$dataSystem.faceSize;
		} else {
			return ImageManager.defaultFaceWidth;
		}
	}

	static loadAnimation(filename) {
		return ImageManager.loadBitmap("img/animations/", filename);
	}

	static loadBattleback1(filename) {
		return ImageManager.loadBitmap("img/battlebacks1/", filename);
	}

	static loadBattleback2(filename) {
		return ImageManager.loadBitmap("img/battlebacks2/", filename);
	}

	static loadEnemy(filename) {
		return ImageManager.loadBitmap("img/enemies/", filename);
	}

	static loadCharacter(filename) {
		return ImageManager.loadBitmap("img/characters/", filename);
	}

	static loadFace(filename) {
		return ImageManager.loadBitmap("img/faces/", filename);
	}

	static loadParallax(filename) {
		return ImageManager.loadBitmap("img/parallaxes/", filename);
	}

	static loadPicture(filename) {
		return ImageManager.loadBitmap("img/pictures/", filename);
	}

	static loadSvActor(filename) {
		return ImageManager.loadBitmap("img/sv_actors/", filename);
	}

	static loadSvEnemy(filename) {
		return ImageManager.loadBitmap("img/sv_enemies/", filename);
	}

	static loadSystem(filename) {
		return ImageManager.loadBitmap("img/system/", filename);
	}

	static loadTileset(filename) {
		return ImageManager.loadBitmap("img/tilesets/", filename);
	}

	static loadTitle1(filename) {
		return ImageManager.loadBitmap("img/titles1/", filename);
	}

	static loadTitle2(filename) {
		return ImageManager.loadBitmap("img/titles2/", filename);
	}

	static loadBitmap(folder, filename) {
		if (filename) {
			const url = "assets/" + folder + Utils.encodeURI(filename) + ".png";
			return ImageManager.loadBitmapFromUrl(url);
		} else {
			return ImageManager._emptyBitmap;
		}
	}

	static loadBitmapFromUrl(url) {
		const cache = url.includes("/system/")
			? ImageManager._system
			: ImageManager._cache;
		if (!cache[url]) {
			cache[url] = Bitmap.load(url);
		}
		return cache[url];
	}

	static clear() {
		const cache = ImageManager._cache;
		for (const url in cache) {
			cache[url].destroy();
		}
		ImageManager._cache = {};
	}

	static isReady() {
		for (const cache of [ImageManager._cache, ImageManager._system]) {
			for (const url in cache) {
				const bitmap = cache[url];
				if (bitmap.isError()) {
					ImageManager.throwLoadError(bitmap);
				}
				if (!bitmap.isReady()) {
					return false;
				}
			}
		}
		return true;
	}

	static throwLoadError(bitmap) {
		const retry = bitmap.retry.bind(bitmap);
		throw ["LoadError", bitmap.url, retry];
	}

	static isObjectCharacter(filename) {
		const sign = Utils.extractFileName(filename).match(/^[!$]+/);
		return sign && sign[0].includes("!");
	}

	static isBigCharacter(filename) {
		const sign = Utils.extractFileName(filename).match(/^[!$]+/);
		return sign && sign[0].includes("$");
	}

	static isZeroParallax(filename) {
		return Utils.extractFileName(filename).charAt(0) === "!";
	}
}
