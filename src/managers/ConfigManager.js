// ConfigManager
//
// The static class that manages the configuration data.

import { AudioManager } from "./AudioManager.js";

export class ConfigManager {
	static alwaysDash = false;
	static commandRemember = false;
	static touchUI = true;
	static _isLoaded = false;

	constructor() {
		throw new Error("This is a static class");
	}

	static get bgmVolume() {
		return AudioManager._bgmVolume;
	}

	static set bgmVolume(value) {
		AudioManager.bgmVolume = value;
	}

	static get bgsVolume() {
		return AudioManager.bgsVolume;
	}

	static set bgsVolume(value) {
		AudioManager.bgsVolume = value;
	}

	static get meVolume() {
		return AudioManager.meVolume;
	}

	static set meVolume(value) {
		AudioManager.meVolume = value;
	}

	static get seVolume() {
		return AudioManager.seVolume;
	}

	static set seVolume(value) {
		AudioManager.seVolume = value;
	}

	static load() {
		StorageManager.loadObject("config")
			.then((config) => this.applyData(config || {}))
			.catch(() => 0)
			.then(() => {
				this._isLoaded = true;
				return 0;
			})
			.catch(() => 0);
	}

	static save() {
		StorageManager.saveObject("config", this.makeData());
	}

	static isLoaded() {
		return this._isLoaded;
	}

	static makeData() {
		const config = {};
		config.alwaysDash = this.alwaysDash;
		config.commandRemember = this.commandRemember;
		config.touchUI = this.touchUI;
		config.bgmVolume = this.bgmVolume;
		config.bgsVolume = this.bgsVolume;
		config.meVolume = this.meVolume;
		config.seVolume = this.seVolume;
		return config;
	}

	static applyData(config) {
		this.alwaysDash = this.readFlag(config, "alwaysDash", false);
		this.commandRemember = this.readFlag(config, "commandRemember", false);
		this.touchUI = this.readFlag(config, "touchUI", true);
		this.bgmVolume = this.readVolume(config, "bgmVolume");
		this.bgsVolume = this.readVolume(config, "bgsVolume");
		this.meVolume = this.readVolume(config, "meVolume");
		this.seVolume = this.readVolume(config, "seVolume");
	}

	static readFlag(config, name, defaultValue) {
		if (name in config) {
			return !!config[name];
		} else {
			return defaultValue;
		}
	}

	static readVolume(config, name) {
		if (name in config) {
			return Number(config[name]).clamp(0, 100);
		} else {
			return 100;
		}
	}
}
