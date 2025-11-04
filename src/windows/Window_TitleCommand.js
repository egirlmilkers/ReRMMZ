// Window_TitleCommand
//
// The window for selecting New Game/Continue on the title screen.

import { DataManager } from "../managers/DataManager.js";
import { TextManager } from "../managers/TextManager.js";

import { Window_Command } from "./Window_Command.js";

export class Window_TitleCommand extends Window_Command {
	static _lastCommandSymbol = null;

	constructor(rect) {
		super(rect);
		this.openness = 0;
		this.selectLast();
	}

	static initCommandPosition() {
		this._lastCommandSymbol = null;
	}

	makeCommandList() {
		const continueEnabled = this.isContinueEnabled();
		this.addCommand(TextManager.newGame, "newGame");
		this.addCommand(TextManager.continue_, "continue", continueEnabled);
		this.addCommand(TextManager.options, "options");
	}

	isContinueEnabled() {
		return DataManager.isAnySavefileExists();
	}

	processOk() {
		Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
		super.processOk();
	}

	selectLast() {
		if (Window_TitleCommand._lastCommandSymbol) {
			this.selectSymbol(Window_TitleCommand._lastCommandSymbol);
		} else if (this.isContinueEnabled()) {
			this.selectSymbol("continue");
		}
	}
}
