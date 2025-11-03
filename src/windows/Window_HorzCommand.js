// Window_HorzCommand
//
// The command window for the horizontal selection format.

import { Window_Command } from '../windows/index.js';

export function Window_HorzCommand(rect) {
	Window_Command.call(this, rect);
};

Window_HorzCommand.prototype = Object.create(Window_Command.prototype);
Window_HorzCommand.prototype.constructor = Window_HorzCommand;

Window_HorzCommand.prototype.maxCols = function () {
	return 4;
};

Window_HorzCommand.prototype.itemTextAlign = function () {
	return "center";
};
