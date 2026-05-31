// StorageManager
//
// The static class that manages storage for saving game data.

import * as fs from 'fs';
import * as path from 'path';

import localforage from "localforage";
import pako from "pako";

import { JsonEx } from "../core/JsonEx.js";
import { Utils } from "../core/Utils.js";

import { DataManager } from "./DataManager.js";

export class StorageManager {
	static _forageKeys: string[] = [];
	static _forageKeysUpdated: boolean = false;

	constructor() {
		throw new Error("This is a static class");
	}

	static isLocalMode(): boolean {
		return Utils.isNwjs();
	}

	static async saveObject(saveName: string, object: object) {
		const json = await this.objectToJson(object);
		const zip = await this.jsonToZip(json);
		return await this.saveZip(saveName, zip);
	}

	static async loadObject(saveName: string) {
		const zip = await this.loadZip(saveName);
		const json = await this.zipToJson(zip);
		return await this.jsonToObject(json);
	}

	static objectToJson(object: object): Promise<string> {
		return new Promise((resolve, reject) => {
			try {
				const json = JsonEx.stringify(object);
				resolve(json);
			} catch (e) {
				reject(e);
			}
		});
	}

	static jsonToObject(json: string): Promise<object> {
		return new Promise((resolve, reject) => {
			try {
				const object = JsonEx.parse(json);
				resolve(object);
			} catch (e) {
				reject(e);
			}
		});
	}

	static jsonToZip(json: string): Promise<Uint8Array> {
		return new Promise((resolve, reject) => {
			try {
				const zip = pako.deflate(json, { level: 1 });
				if (zip.length >= 50000) {
					console.warn("Save data is too big.");
				}
				resolve(zip);
			} catch (e) {
				reject(e);
			}
		});
	}

	static zipToJson(zip: string | null): Promise<string | "null"> {
		return new Promise((resolve, reject) => {
			try {
				if (zip) {
					const data = pako.deflate(zip)
					const json = pako.inflate(data, { to: "string" });
					resolve(json);
				} else {
					resolve("null");
				}
			} catch (e) {
				reject(e);
			}
		});
	}

	static saveZip(saveName: string, zip: Uint8Array): Promise<void> {
		if (this.isLocalMode()) {
			return this.saveToLocalFile(saveName, zip);
		} else {
			return this.saveToForage(saveName, zip);
		}
	}

	static loadZip(saveName: string): Promise<string | null> {
		if (this.isLocalMode()) {
			return this.loadFromLocalFile(saveName);
		} else {
			return this.loadFromForage(saveName);
		}
	}

	static exists(saveName: string): boolean {
		if (this.isLocalMode()) {
			return this.localFileExists(saveName);
		} else {
			return this.forageExists(saveName);
		}
	}

	static remove(saveName: string): Promise<void> | void {
		if (this.isLocalMode()) {
			return this.removeLocalFile(saveName);
		} else {
			return this.removeForage(saveName);
		}
	}

	static saveToLocalFile(saveName: string, zip: Uint8Array): Promise<void> {
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

	static loadFromLocalFile(saveName: string): Promise<string> {
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

	static localFileExists(saveName: string): boolean {
		return fs.existsSync(this.filePath(saveName));
	}

	static removeLocalFile(saveName: string) {
		this.fsUnlink(this.filePath(saveName));
	}

	static async saveToForage(saveName: string, zip: Uint8Array): Promise<void> {
		const key = this.forageKey(saveName);
		const testKey = this.forageTestKey();
		setTimeout(() => localforage.removeItem(testKey));
		await localforage.setItem(testKey, zip);
		await localforage.setItem(key, zip);
		return await this.updateForageKeys();
	}

	static loadFromForage(saveName: string): Promise<string | null> {
		const key = this.forageKey(saveName);
		return localforage.getItem(key);
	}

	static forageExists(saveName: string): boolean {
		const key = this.forageKey(saveName);
		return this._forageKeys.includes(key);
	}

	static async removeForage(saveName: string): Promise<void> {
		const key = this.forageKey(saveName);
		await localforage.removeItem(key);
		return await this.updateForageKeys();
	}

	static async updateForageKeys() {
		this._forageKeysUpdated = false;
		const keys = await localforage.keys();
		this._forageKeys = keys;
		this._forageKeysUpdated = true;
	}

	static forageKeysUpdated(): boolean {
		return this._forageKeysUpdated;
	}

	static fsMkdir(path: string) {
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	}

	static fsRename(oldPath: string, newPath: string) {
		if (fs.existsSync(oldPath)) {
			fs.renameSync(oldPath, newPath);
		}
	}

	static fsUnlink(path: string) {
		const fs = require("fs");
		if (fs.existsSync(path)) {
			fs.unlinkSync(path);
		}
	}

	static fsReadFile(path: string): string | null {
		if (fs.existsSync(path)) {
			return fs.readFileSync(path, { encoding: "utf8" });
		} else {
			return null;
		}
	}

	static fsWriteFile(path: string, data: Uint8Array) {
		fs.writeFileSync(path, data);
	}

	static fileDirectoryPath(): string {
		const base = process.cwd();
		return path.join(base, "assets/save/");
	}

	static filePath(saveName: string): string {
		const dir = this.fileDirectoryPath();
		return dir + saveName + ".rmmzsave";
	}

	static forageKey(saveName: string): string {
		const gameId = DataManager.$dataSystem.advanced.gameId;
		return "rmmzsave." + gameId + "." + saveName;
	}

	static forageTestKey(): string {
		return "rmmzsave.test";
	}
}
