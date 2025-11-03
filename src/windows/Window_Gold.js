// Window_Gold
//
// The window for displaying the party's gold.

import { DataManager, TextManager } from '../managers/index.js';
import { Window_Selectable } from '../windows/index.js';

export function Window_Gold(rect) {
	Window_Selectable.call(this, rect);
	this.refresh();
};

Window_Gold.prototype = Object.create(Window_Selectable.prototype);
Window_Gold.prototype.constructor = Window_Gold;

Window_Gold.prototype.colSpacing = function () {
	return 0;
};

Window_Gold.prototype.refresh = function () {
	const rect = this.itemLineRect(0);
	const x = rect.x;
	const y = rect.y;
	const width = rect.width;
	this.contents.clear();
	this.drawCurrencyValue(this.value(), this.currencyUnit(), x, y, width);
};

Window_Gold.prototype.value = function () {
	return DataManager.$gameParty.gold();
};

Window_Gold.prototype.currencyUnit = function () {
	return TextManager.currencyUnit;
};

Window_Gold.prototype.open = function () {
	this.refresh();
	Window_Selectable.prototype.open.call(this);
};
