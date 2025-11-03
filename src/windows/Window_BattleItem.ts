// Window_BattleItem
//
// The window for selecting an item to use on the battle screen.

import { DataManager } from "../managers/index.js";
import { Window_ItemList } from "../windows/index.js";

export class Window_BattleItem extends Window_ItemList {
	constructor(rect) {
		super(rect);
		this.hide();
	}

	includes(item) {
		return DataManager.$gameParty.canUse(item);
	}

	show() {
		this.selectLast();
		this.showHelpWindow();
		super.show();
	}

	hide() {
		this.hideHelpWindow();
		super.hide();
	}
}
