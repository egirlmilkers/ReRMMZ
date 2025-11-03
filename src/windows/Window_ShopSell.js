// Window_ShopSell
//
// The window for selecting an item to sell on the shop screen.

import { Window_ItemList } from '../windows/index.js';

export function Window_ShopSell(rect) {
	Window_ItemList.call(this, rect);
};

Window_ShopSell.prototype = Object.create(Window_ItemList.prototype);
Window_ShopSell.prototype.constructor = Window_ShopSell;

Window_ShopSell.prototype.isEnabled = function (item) {
	return item && item.price > 0;
};
