// Window_StatusParams
//
// The window for displaying parameters on the status screen.

import { ColorManager } from "src/managers/ColorManager.js";
import { TextManager } from "src/managers/TextManager.js";

import { Window_StatusBase } from "./Window_StatusBase.js";

export class Window_StatusParams extends Window_StatusBase {
	constructor(rect) {
		super(rect);
		this._actor = null;
	}

	setActor(actor) {
		if (this._actor !== actor) {
			this._actor = actor;
			this.refresh();
		}
	}

	maxItems() {
		return 6;
	}

	itemHeight() {
		return this.lineHeight();
	}

	drawItem(index) {
		const rect = this.itemLineRect(index);
		const paramId = index + 2;
		const name = TextManager.param(paramId);
		const value = this._actor.param(paramId);
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(name, rect.x, rect.y, 160);
		this.resetTextColor();
		this.drawText(value, rect.x + 160, rect.y, 60, "right");
	}

	drawItemBackground() /*index*/ {
		//
	}
}
