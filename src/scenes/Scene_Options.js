// Scene_Options
//
// The scene class of the options screen.

import { Graphics } from "src/core/Graphics.js";
import { Rectangle } from "src/core/Rectangle.js";

import { ConfigManager } from "src/managers/ConfigManager.js";

import { Window_Options } from "src/windows/Window_Options.js";

import { Scene_MenuBase } from "./Scene_MenuBase.js";

export class Scene_Options extends Scene_MenuBase {
	constructor() {
		super();
	}

	create() {
		super.create();
		this.createOptionsWindow();
	}

	terminate() {
		super.terminate();
		ConfigManager.save();
	}

	createOptionsWindow() {
		const rect = this.optionsWindowRect();
		this._optionsWindow = new Window_Options(rect);
		this._optionsWindow.setHandler("cancel", this.popScene.bind(this));
		this.addWindow(this._optionsWindow);
	}

	optionsWindowRect() {
		const n = Math.min(this.maxCommands(), this.maxVisibleCommands());
		const ww = 400;
		const wh = this.calcWindowHeight(n, true);
		const wx = (Graphics.boxWidth - ww) / 2;
		const wy = (Graphics.boxHeight - wh) / 2;
		return new Rectangle(wx, wy, ww, wh);
	}

	maxCommands() {
		// Increase this value when adding option items.
		return 7;
	}

	maxVisibleCommands() {
		return 12;
	}
}
