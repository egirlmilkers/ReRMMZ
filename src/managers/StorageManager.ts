// StorageManager
//
// The static class that manages storage for saving game data.

import pako from "pako";
import { JsonEx, Utils } from "../core/index.js";
import { DataManager } from "../managers/index.js";

export class StorageManager {
	static _forageKeys = [];
	static _forageKeysUpdated = false;

	constructor() {
		throw new Error("This is a static class");
	}

	static isLocalMode() {
		return Utils.isNwjs();
	}

	static saveObject(saveName, object) {
		return StorageManager.objectToJson(object)
			.then((json) => StorageManager.jsonToZip(json))
			.then((zip) => StorageManager.saveZip(saveName, zip));
	}

	static loadObject(saveName) {
		return StorageManager.loadZip(saveName)
			.then((zip) => StorageManager.zipToJson(zip))
			.then((json) => StorageManager.jsonToObject(json));
	}

	static objectToJson(object) {
		return new Promise((resolve, reject) => {
			try {
				const json = JsonEx.stringify(object);
				resolve(json);
			} catch (e) {
				reject(e);
			}
		});
	}

	static jsonToObject(json) {
		return new Promise((resolve, reject) => {
			try {
				const object = JsonEx.parse(json);
				resolve(object);
			} catch (e) {
				reject(e);
			}
		});
	}

	static jsonToZip(json) {
		return new Promise((resolve, reject) => {
			try {
				const zip = pako.deflate(json, { to: "string", level: 1 });
				if (zip.length >= 50000) {
					console.warn("Save data is too big.");
				}
				resolve(zip);
			} catch (e) {
				reject(e);
			}
		});
	}

	static zipToJson(zip) {
		return new Promise((resolve, reject) => {
			try {
				if (zip) {
					const json = pako.inflate(zip, { to: "string" });
					resolve(json);
				} else {
					resolve("null");
				}
			} catch (e) {
				reject(e);
			}
		});
	}

	static saveZip(saveName, zip) {
		if (StorageManager.isLocalMode()) {
			return StorageManager.saveToLocalFile(saveName, zip);
		} else {
			return StorageManager.saveToForage(saveName, zip);
		}
	}

	static loadZip(saveName) {
		if (StorageManager.isLocalMode()) {
			return StorageManager.loadFromLocalFile(saveName);
		} else {
			return StorageManager.loadFromForage(saveName);
		}
	}

	static exists(saveName) {
		if (StorageManager.isLocalMode()) {
			return StorageManager.localFileExists(saveName);
		} else {
			return StorageManager.forageExists(saveName);
		}
	}

	static remove(saveName) {
		if (StorageManager.isLocalMode()) {
			return StorageManager.removeLocalFile(saveName);
		} else {
			return StorageManager.removeForage(saveName);
		}
	}

	static saveToLocalFile(saveName, zip) {
		const dirPath = StorageManager.fileDirectoryPath();
		const filePath = StorageManager.filePath(saveName);
		const backupFilePath = filePath + "_";
		return new Promise((resolve, reject) => {
			StorageManager.fsMkdir(dirPath);
			StorageManager.fsUnlink(backupFilePath);
			StorageManager.fsRename(filePath, backupFilePath);
			try {
				StorageManager.fsWriteFile(filePath, zip);
				StorageManager.fsUnlink(backupFilePath);
				resolve();
			} catch (e) {
				try {
					StorageManager.fsUnlink(filePath);
					StorageManager.fsRename(backupFilePath, filePath);
				} catch (e2) {
					//
				}
				reject(e);
			}
		});
	}

	static loadFromLocalFile(saveName) {
		const filePath = StorageManager.filePath(saveName);
		return new Promise((resolve, reject) => {
			const data = StorageManager.fsReadFile(filePath);
			if (data) {
				resolve(data);
			} else {
				reject(new Error("Savefile not found"));
			}
		});
	}

	static localFileExists(saveName) {
		const fs = require("fs");
		return fs.existsSync(StorageManager.filePath(saveName));
	}

	static removeLocalFile(saveName) {
		StorageManager.fsUnlink(StorageManager.filePath(saveName));
	}

	static saveToForage(saveName, zip) {
		const key = StorageManager.forageKey(saveName);
		const testKey = StorageManager.forageTestKey();
		setTimeout(() => localforage.removeItem(testKey));
		return localforage
			.setItem(testKey, zip)
			.then(() => localforage.setItem(key, zip))
			.then(() => StorageManager.updateForageKeys());
	}

	static loadFromForage(saveName) {
		const key = StorageManager.forageKey(saveName);
		return localforage.getItem(key);
	}

	static forageExists(saveName) {
		const key = StorageManager.forageKey(saveName);
		return StorageManager._forageKeys.includes(key);
	}

	static removeForage(saveName) {
		const key = StorageManager.forageKey(saveName);
		return localforage
			.removeItem(key)
			.then(() => StorageManager.updateForageKeys());
	}

	static updateForageKeys() {
		StorageManager._forageKeysUpdated = false;
		return localforage.keys().then((keys) => {
			StorageManager._forageKeys = keys;
			StorageManager._forageKeysUpdated = true;
			return 0;
		});
	}

	static forageKeysUpdated() {
		return StorageManager._forageKeysUpdated;
	}

	static fsMkdir(path) {
		const fs = require("fs");
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	}

	static fsRename(oldPath, newPath) {
		const fs = require("fs");
		if (fs.existsSync(oldPath)) {
			fs.renameSync(oldPath, newPath);
		}
	}

	static fsUnlink(path) {
		const fs = require("fs");
		if (fs.existsSync(path)) {
			fs.unlinkSync(path);
		}
	}

	static fsReadFile(path) {
		const fs = require("fs");
		if (fs.existsSync(path)) {
			return fs.readFileSync(path, { encoding: "utf8" });
		} else {
			return null;
		}
	}

	static fsWriteFile(path, data) {
		const fs = require("fs");
		fs.writeFileSync(path, data);
	}

	static fileDirectoryPath() {
		const path = require("path");
		const base = process.cwd();
		return path.join(base, "assets/save/");
	}

	static filePath(saveName) {
		const dir = StorageManager.fileDirectoryPath();
		return dir + saveName + ".rmmzsave";
	}

	static forageKey(saveName) {
		const gameId = DataManager.$dataSystem.advanced.gameId;
		return "rmmzsave." + gameId + "." + saveName;
	}

	static forageTestKey() {
		return "rmmzsave.test";
	}
}
