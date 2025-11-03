// Window_GameEnd
//
// The window for selecting "Go to Title" on the game end screen.

import { TextManager } from '../managers/index.js';
import { Window_Command } from '../windows/index.js';

export function Window_GameEnd(rect) {
	Window_Command.call(this, rect);
	this.openness = 0;
	this.open();
};

Window_GameEnd.prototype = Object.create(Window_Command.prototype);
Window_GameEnd.prototype.constructor = Window_GameEnd;

Window_GameEnd.prototype.makeCommandList = function () {
	this.addCommand(TextManager.toTitle, "toTitle");
	this.addCommand(TextManager.cancel, "cancel");
};
