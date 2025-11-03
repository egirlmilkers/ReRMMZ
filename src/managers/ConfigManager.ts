// ConfigManager
//
// The static class that manages the configuration data.

import { AudioManager, StorageManager } from "../managers/index.js";

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
			.then((config) => ConfigManager.applyData(config || {}))
			.catch(() => 0)
			.then(() => {
				ConfigManager._isLoaded = true;
				return 0;
			})
			.catch(() => 0);
	}

	static save() {
		StorageManager.saveObject("config", ConfigManager.makeData());
	}

	static isLoaded() {
		return ConfigManager._isLoaded;
	}

	static makeData() {
		const config = {};
		config.alwaysDash = ConfigManager.alwaysDash;
		config.commandRemember = ConfigManager.commandRemember;
		config.touchUI = ConfigManager.touchUI;
		config.bgmVolume = ConfigManager.bgmVolume;
		config.bgsVolume = ConfigManager.bgsVolume;
		config.meVolume = ConfigManager.meVolume;
		config.seVolume = ConfigManager.seVolume;
		return config;
	}

	static applyData(config) {
		ConfigManager.alwaysDash = ConfigManager.readFlag(
			config,
			"alwaysDash",
			false,
		);
		ConfigManager.commandRemember = ConfigManager.readFlag(
			config,
			"commandRemember",
			false,
		);
		ConfigManager.touchUI = ConfigManager.readFlag(config, "touchUI", true);
		ConfigManager.bgmVolume = ConfigManager.readVolume(config, "bgmVolume");
		ConfigManager.bgsVolume = ConfigManager.readVolume(config, "bgsVolume");
		ConfigManager.meVolume = ConfigManager.readVolume(config, "meVolume");
		ConfigManager.seVolume = ConfigManager.readVolume(config, "seVolume");
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
