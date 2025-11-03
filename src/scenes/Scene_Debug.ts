// Scene_Debug
//
// The scene class of the debug screen.

import { Graphics, Rectangle } from "../core/index.js";
import { Scene_MenuBase } from "../scenes/index.js";
import {
	Window_Base,
	Window_DebugEdit,
	Window_DebugRange,
} from "../windows/index.js";

export class Scene_Debug extends Scene_MenuBase {
	constructor() {
		super();
	}

	create() {
		super.create();
		this.createRangeWindow();
		this.createEditWindow();
		this.createDebugHelpWindow();
	}

	needsCancelButton() {
		return false;
	}

	createRangeWindow() {
		const rect = this.rangeWindowRect();
		this._rangeWindow = new Window_DebugRange(rect);
		this._rangeWindow.setHandler("ok", this.onRangeOk.bind(this));
		this._rangeWindow.setHandler("cancel", this.popScene.bind(this));
		this.addWindow(this._rangeWindow);
	}

	rangeWindowRect() {
		const wx = 0;
		const wy = 0;
		const ww = 246;
		const wh = Graphics.boxHeight;
		return new Rectangle(wx, wy, ww, wh);
	}

	createEditWindow() {
		const rect = this.editWindowRect();
		this._editWindow = new Window_DebugEdit(rect);
		this._editWindow.setHandler("cancel", this.onEditCancel.bind(this));
		this._rangeWindow.setEditWindow(this._editWindow);
		this.addWindow(this._editWindow);
	}

	editWindowRect() {
		const wx = this._rangeWindow.width;
		const wy = 0;
		const ww = Graphics.boxWidth - wx;
		const wh = this.calcWindowHeight(10, true);
		return new Rectangle(wx, wy, ww, wh);
	}

	createDebugHelpWindow() {
		const rect = this.debugHelpWindowRect();
		this._debugHelpWindow = new Window_Base(rect);
		this.addWindow(this._debugHelpWindow);
	}

	debugHelpWindowRect() {
		const wx = this._editWindow.x;
		const wy = this._editWindow.height;
		const ww = this._editWindow.width;
		const wh = Graphics.boxHeight - wy;
		return new Rectangle(wx, wy, ww, wh);
	}

	onRangeOk() {
		this._editWindow.activate();
		this._editWindow.select(0);
		this.refreshHelpWindow();
	}

	onEditCancel() {
		this._rangeWindow.activate();
		this._editWindow.deselect();
		this.refreshHelpWindow();
	}

	refreshHelpWindow() {
		const helpWindow = this._debugHelpWindow;
		helpWindow.contents.clear();
		if (this._editWindow.active) {
			const rect = helpWindow.baseTextRect();
			helpWindow.drawTextEx(this.helpText(), rect.x, rect.y, rect.width);
		}
	}

	helpText() {
		if (this._rangeWindow.mode() === "switch") {
			return "Enter : ON / OFF";
		} else {
			return (
				"Left     :  -1    Pageup   : -10\n" +
				"Right    :  +1    Pagedown : +10"
			);
		}
	}
}
