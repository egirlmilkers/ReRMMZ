// Window_ShopSell
//
// The window for selecting an item to sell on the shop screen.

import { Window_ItemList } from "./Window_ItemList.js";

export class Window_ShopSell extends Window_ItemList {
	constructor(rect) {
		super(rect);
	}

	isEnabled(item) {
		return item && item.price > 0;
	}
}
