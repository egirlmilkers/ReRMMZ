//-----------------------------------------------------------------------------
// Window_MenuActor
//
// The window for selecting a target actor on the item and skill screens.

import { DataManager } from '../managers/index.js';
import { Game_Action } from '../objects/index.js';
import { Window_MenuStatus } from '../windows/index.js';

export function Window_MenuActor() {
	this.initialize(...arguments);
}

Window_MenuActor.prototype = Object.create(Window_MenuStatus.prototype);
Window_MenuActor.prototype.constructor = Window_MenuActor;

Window_MenuActor.prototype.initialize = function (rect) {
	Window_MenuStatus.prototype.initialize.call(this, rect);
	this.hide();
};

Window_MenuActor.prototype.processOk = function () {
	if (!this.cursorAll()) {
		DataManager.$gameParty.setTargetActor(DataManager.$gameParty.members()[this.index()]);
	}
	this.callOkHandler();
};

Window_MenuActor.prototype.selectLast = function () {
	this.forceSelect(DataManager.$gameParty.targetActor().index() || 0);
};

Window_MenuActor.prototype.selectForItem = function (item) {
	const actor = DataManager.$gameParty.menuActor();
	const action = new Game_Action(actor);
	action.setItemObject(item);
	this.setCursorFixed(false);
	this.setCursorAll(false);
	if (action.isForUser()) {
		if (DataManager.isSkill(item)) {
			this.setCursorFixed(true);
			this.forceSelect(actor.index());
		} else {
			this.selectLast();
		}
	} else if (action.isForAll()) {
		this.setCursorAll(true);
		this.forceSelect(0);
	} else {
		this.selectLast();
	}
};
