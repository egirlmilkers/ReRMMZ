// Window_Options
//
// The window for changing various settings on the options screen.

import { ConfigManager } from "src/managers/ConfigManager.js";
import { TextManager } from "src/managers/TextManager.js";

import { Window_Command } from "./Window_Command.js";

export class Window_Options extends Window_Command {
	constructor(rect) {
		super(rect);
	}

	makeCommandList() {
		this.addGeneralOptions();
		this.addVolumeOptions();
	}

	addGeneralOptions() {
		this.addCommand(TextManager.alwaysDash, "alwaysDash");
		this.addCommand(TextManager.commandRemember, "commandRemember");
		this.addCommand(TextManager.touchUI, "touchUI");
	}

	addVolumeOptions() {
		this.addCommand(TextManager.bgmVolume, "bgmVolume");
		this.addCommand(TextManager.bgsVolume, "bgsVolume");
		this.addCommand(TextManager.meVolume, "meVolume");
		this.addCommand(TextManager.seVolume, "seVolume");
	}

	drawItem(index) {
		const title = this.commandName(index);
		const status = this.statusText(index);
		const rect = this.itemLineRect(index);
		const statusWidth = this.statusWidth();
		const titleWidth = rect.width - statusWidth;
		this.resetTextColor();
		this.changePaintOpacity(this.isCommandEnabled(index));
		this.drawText(title, rect.x, rect.y, titleWidth, "left");
		this.drawText(
			status,
			rect.x + titleWidth,
			rect.y,
			statusWidth,
			"right",
		);
	}

	statusWidth() {
		return 120;
	}

	statusText(index) {
		const symbol = this.commandSymbol(index);
		const value = this.getConfigValue(symbol);
		if (this.isVolumeSymbol(symbol)) {
			return this.volumeStatusText(value);
		} else {
			return this.booleanStatusText(value);
		}
	}

	isVolumeSymbol(symbol) {
		return symbol.includes("Volume");
	}

	booleanStatusText(value) {
		return value ? "ON" : "OFF";
	}

	volumeStatusText(value) {
		return value + "%";
	}

	processOk() {
		const index = this.index();
		const symbol = this.commandSymbol(index);
		if (this.isVolumeSymbol(symbol)) {
			this.changeVolume(symbol, true, true);
		} else {
			this.changeValue(symbol, !this.getConfigValue(symbol));
		}
	}

	cursorRight() {
		const index = this.index();
		const symbol = this.commandSymbol(index);
		if (this.isVolumeSymbol(symbol)) {
			this.changeVolume(symbol, true, false);
		} else {
			this.changeValue(symbol, true);
		}
	}

	cursorLeft() {
		const index = this.index();
		const symbol = this.commandSymbol(index);
		if (this.isVolumeSymbol(symbol)) {
			this.changeVolume(symbol, false, false);
		} else {
			this.changeValue(symbol, false);
		}
	}

	changeVolume(symbol, forward, wrap) {
		const lastValue = this.getConfigValue(symbol);
		const offset = this.volumeOffset();
		const value = lastValue + (forward ? offset : -offset);
		if (value > 100 && wrap) {
			this.changeValue(symbol, 0);
		} else {
			this.changeValue(symbol, value.clamp(0, 100));
		}
	}

	volumeOffset() {
		return 20;
	}

	changeValue(symbol, value) {
		const lastValue = this.getConfigValue(symbol);
		if (lastValue !== value) {
			this.setConfigValue(symbol, value);
			this.redrawItem(this.findSymbol(symbol));
			this.playCursorSound();
		}
	}

	getConfigValue(symbol) {
		return ConfigManager[symbol];
	}

	setConfigValue(symbol, volume) {
		ConfigManager[symbol] = volume;
	}
}
