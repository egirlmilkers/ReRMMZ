// StorageManager
//
// The static class that manages storage for saving game data.

import { JsonEx, Utils } from '../core/index.js';
import { DataManager } from '../managers/index.js';
import pako from 'pako';

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
        return this.objectToJson(object)
            .then((json) => this.jsonToZip(json))
            .then((zip) => this.saveZip(saveName, zip));
    }

    static loadObject(saveName) {
        return this.loadZip(saveName)
            .then((zip) => this.zipToJson(zip))
            .then((json) => this.jsonToObject(json));
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
        if (this.isLocalMode()) {
            return this.saveToLocalFile(saveName, zip);
        } else {
            return this.saveToForage(saveName, zip);
        }
    }

    static loadZip(saveName) {
        if (this.isLocalMode()) {
            return this.loadFromLocalFile(saveName);
        } else {
            return this.loadFromForage(saveName);
        }
    }

    static exists(saveName) {
        if (this.isLocalMode()) {
            return this.localFileExists(saveName);
        } else {
            return this.forageExists(saveName);
        }
    }

    static remove(saveName) {
        if (this.isLocalMode()) {
            return this.removeLocalFile(saveName);
        } else {
            return this.removeForage(saveName);
        }
    }

    static saveToLocalFile(saveName, zip) {
        const dirPath = this.fileDirectoryPath();
        const filePath = this.filePath(saveName);
        const backupFilePath = filePath + "_";
        return new Promise((resolve, reject) => {
            this.fsMkdir(dirPath);
            this.fsUnlink(backupFilePath);
            this.fsRename(filePath, backupFilePath);
            try {
                this.fsWriteFile(filePath, zip);
                this.fsUnlink(backupFilePath);
                resolve();
            } catch (e) {
                try {
                    this.fsUnlink(filePath);
                    this.fsRename(backupFilePath, filePath);
                } catch (e2) {
                    //
                }
                reject(e);
            }
        });
    }

    static loadFromLocalFile(saveName) {
        const filePath = this.filePath(saveName);
        return new Promise((resolve, reject) => {
            const data = this.fsReadFile(filePath);
            if (data) {
                resolve(data);
            } else {
                reject(new Error("Savefile not found"));
            }
        });
    }

    static localFileExists(saveName) {
        const fs = require("fs");
        return fs.existsSync(this.filePath(saveName));
    }

    static removeLocalFile(saveName) {
        this.fsUnlink(this.filePath(saveName));
    }

    static saveToForage(saveName, zip) {
        const key = this.forageKey(saveName);
        const testKey = this.forageTestKey();
        setTimeout(() => localforage.removeItem(testKey));
        return localforage
            .setItem(testKey, zip)
            .then(() => localforage.setItem(key, zip))
            .then(() => this.updateForageKeys());
    }

    static loadFromForage(saveName) {
        const key = this.forageKey(saveName);
        return localforage.getItem(key);
    }

    static forageExists(saveName) {
        const key = this.forageKey(saveName);
        return this._forageKeys.includes(key);
    }

    static removeForage(saveName) {
        const key = this.forageKey(saveName);
        return localforage.removeItem(key).then(() => this.updateForageKeys());
    }

    static updateForageKeys() {
        this._forageKeysUpdated = false;
        return localforage.keys().then((keys) => {
            this._forageKeys = keys;
            this._forageKeysUpdated = true;
            return 0;
        });
    }

    static forageKeysUpdated() {
        return this._forageKeysUpdated;
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
        const dir = this.fileDirectoryPath();
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
