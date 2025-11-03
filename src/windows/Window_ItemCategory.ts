// Window_ItemCategory
//
// The window for selecting a category of items on the item and shop screens.

import { DataManager, TextManager } from "../managers/index.js";
import { Window_HorzCommand } from "../windows/index.js";

export class Window_ItemCategory extends Window_HorzCommand {
	constructor(rect) {
		super(rect);
	}

	maxCols() {
		return 4;
	}

	update() {
		super.update();
		if (this._itemWindow) {
			this._itemWindow.setCategory(this.currentSymbol());
		}
	}

	makeCommandList() {
		if (this.needsCommand("item")) {
			this.addCommand(TextManager.item, "item");
		}
		if (this.needsCommand("weapon")) {
			this.addCommand(TextManager.weapon, "weapon");
		}
		if (this.needsCommand("armor")) {
			this.addCommand(TextManager.armor, "armor");
		}
		if (this.needsCommand("keyItem")) {
			this.addCommand(TextManager.keyItem, "keyItem");
		}
	}

	needsCommand(name) {
		const table = ["item", "weapon", "armor", "keyItem"];
		const index = table.indexOf(name);
		if (index >= 0) {
			return DataManager.$dataSystem.itemCategories[index];
		}
		return true;
	}

	setItemWindow(itemWindow) {
		this._itemWindow = itemWindow;
	}

	needsSelection() {
		return this.maxItems() >= 2;
	}
}
