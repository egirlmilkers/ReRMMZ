// Window_PartyCommand
//
// The window for selecting whether to fight or escape on the battle screen.

import { BattleManager, TextManager } from '../managers/index.js';
import { Window_Command } from '../windows/index.js';

export function Window_PartyCommand(rect) {
	Window_Command.call(this, rect);
	this.openness = 0;
	this.deactivate();
};

Window_PartyCommand.prototype = Object.create(Window_Command.prototype);
Window_PartyCommand.prototype.constructor = Window_PartyCommand;

Window_PartyCommand.prototype.makeCommandList = function () {
	this.addCommand(TextManager.fight, "fight");
	this.addCommand(TextManager.escape, "escape", BattleManager.canEscape());
};

Window_PartyCommand.prototype.setup = function () {
	this.refresh();
	this.forceSelect(0);
	this.activate();
	this.open();
};
