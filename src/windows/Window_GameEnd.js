// Window_GameEnd
//
// The window for selecting "Go to Title" on the game end screen.

import { TextManager } from "src/managers/TextManager.js";

import { Window_Command } from "./Window_Command.js";

export class Window_GameEnd extends Window_Command {
	constructor(rect) {
		super(rect);
		this.openness = 0;
		this.open();
	}

	makeCommandList() {
		this.addCommand(TextManager.toTitle, "toTitle");
		this.addCommand(TextManager.cancel, "cancel");
	}
}
