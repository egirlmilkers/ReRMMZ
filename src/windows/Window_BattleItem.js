// Window_BattleItem
//
// The window for selecting an item to use on the battle screen.

import { DataManager } from '../managers/index.js';
import { Window_ItemList } from '../windows/index.js';

export function Window_BattleItem(rect) {
	Window_ItemList.call(this, rect);
	this.hide();
};

Window_BattleItem.prototype = Object.create(Window_ItemList.prototype);
Window_BattleItem.prototype.constructor = Window_BattleItem;

Window_BattleItem.prototype.includes = function (item) {
	return DataManager.$gameParty.canUse(item);
};

Window_BattleItem.prototype.show = function () {
	this.selectLast();
	this.showHelpWindow();
	Window_ItemList.prototype.show.call(this);
};

Window_BattleItem.prototype.hide = function () {
	this.hideHelpWindow();
	Window_ItemList.prototype.hide.call(this);
};
