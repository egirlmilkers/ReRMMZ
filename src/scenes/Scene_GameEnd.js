// Scene_GameEnd
//
// The scene class of the game end screen.

import { Graphics } from "../core/Graphics.js";
import { Rectangle } from "../core/Rectangle.js";

import { SceneManager } from "../managers/SceneManager.js";

import { Window_GameEnd } from "../windows/Window_GameEnd.js";
import { Window_TitleCommand } from "../windows/Window_TitleCommand.js";

import { Scene_MenuBase } from "./Scene_MenuBase.js";
import { Scene_Title } from "./Scene_Title.js";

export class Scene_GameEnd extends Scene_MenuBase {
	constructor() {
		super();
	}

	create() {
		super.create();
		this.createCommandWindow();
	}

	stop() {
		super.stop();
		this._commandWindow.close();
	}

	createBackground() {
		super.createBackground();
		this.setBackgroundOpacity(128);
	}

	createCommandWindow() {
		const rect = this.commandWindowRect();
		this._commandWindow = new Window_GameEnd(rect);
		this._commandWindow.setHandler(
			"toTitle",
			this.commandToTitle.bind(this),
		);
		this._commandWindow.setHandler("cancel", this.popScene.bind(this));
		this.addWindow(this._commandWindow);
	}

	commandWindowRect() {
		const ww = this.mainCommandWidth();
		const wh = this.calcWindowHeight(2, true);
		const wx = (Graphics.boxWidth - ww) / 2;
		const wy = (Graphics.boxHeight - wh) / 2;
		return new Rectangle(wx, wy, ww, wh);
	}

	commandToTitle() {
		this.fadeOutAll();
		SceneManager.goto(Scene_Title);
		Window_TitleCommand.initCommandPosition();
	}
}
