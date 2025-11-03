// Scene_GameEnd
//
// The scene class of the game end screen.

import { Graphics, Rectangle } from "../core/index.js";
import { SceneManager } from "../managers/index.js";
import { Scene_MenuBase, Scene_Title } from "../scenes/index.js";
import { Window_GameEnd, Window_TitleCommand } from "../windows/index.js";

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
		this._commandWindow.setHandler("toTitle", this.commandToTitle.bind(this));
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
