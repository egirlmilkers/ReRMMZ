// Window_MenuActor
//
// The window for selecting a target actor on the item and skill screens.

import { DataManager } from "../managers/DataManager.js";

import { Game_Action } from "../objects/Game_Action.js";

import { Window_MenuStatus } from "./Window_MenuStatus.js";

export class Window_MenuActor extends Window_MenuStatus {
	constructor(rect) {
		super(rect);
		this.hide();
	}

	processOk() {
		if (!this.cursorAll()) {
			DataManager.$gameParty.setTargetActor(
				DataManager.$gameParty.members()[this.index()],
			);
		}
		this.callOkHandler();
	}

	selectLast() {
		this.forceSelect(DataManager.$gameParty.targetActor().index() || 0);
	}

	selectForItem(item) {
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
	}
}
