// Window_Help
//
// The window for displaying the description of the selected item.

import { Window_Base } from "../windows/index.js";

export class Window_Help extends Window_Base {
	constructor(rect) {
		super(rect);
		this._text = "";
	}

	setText(text) {
		if (this._text !== text) {
			this._text = text;
			this.refresh();
		}
	}

	clear() {
		this.setText("");
	}

	setItem(item) {
		this.setText(item ? item.description : "");
	}

	refresh() {
		const rect = this.baseTextRect();
		this.contents.clear();
		this.drawTextEx(this._text, rect.x, rect.y, rect.width);
	}
}
