// Window_ScrollText
//
// The window for displaying scrolling text. No frame is displayed, but it
// is handled as a window for convenience.

import { Input } from "src/core/Input.js";
import { Rectangle } from "src/core/Rectangle.js";
import { TouchInput } from "src/core/TouchInput.js";

import { DataManager } from "src/managers/DataManager.js";

import { Window_Base } from "./Window_Base.js";

export class Window_ScrollText extends Window_Base {
	constructor(rect) {
		super(new Rectangle());
		this.opacity = 0;
		this.hide();
		this._reservedRect = rect;
		this._text = "";
		this._maxBitmapHeight = 2048;
		this._allTextHeight = 0;
		this._blockHeight = 0;
		this._blockIndex = 0;
		this._scrollY = 0;
	}

	update() {
		super.update();
		if (DataManager.$gameMessage.scrollMode()) {
			if (this._text) {
				this.updateMessage();
			}
			if (!this._text && DataManager.$gameMessage.hasText()) {
				this.startMessage();
			}
		}
	}

	startMessage() {
		this._text = DataManager.$gameMessage.allText();
		if (this._text) {
			this.updatePlacement();
			this._allTextHeight = this.textSizeEx(this._text).height;
			this._blockHeight = this._maxBitmapHeight - this.height;
			this._blockIndex = 0;
			this.origin.y = this._scrollY = -this.height;
			this.createContents();
			this.refresh();
			this.show();
		} else {
			DataManager.$gameMessage.clear();
		}
	}

	refresh() {
		const rect = this.baseTextRect();
		const y = rect.y - this._scrollY + (this._scrollY % this._blockHeight);
		this.contents.clear();
		this.drawTextEx(this._text, rect.x, y, rect.width);
	}

	updatePlacement() {
		const rect = this._reservedRect;
		this.move(rect.x, rect.y, rect.width, rect.height);
	}

	contentsHeight() {
		if (this._allTextHeight > 0) {
			return Math.min(this._allTextHeight, this._maxBitmapHeight);
		} else {
			return 0;
		}
	}

	updateMessage() {
		this._scrollY += this.scrollSpeed();
		if (this._scrollY >= this._allTextHeight) {
			this.terminateMessage();
		} else {
			const blockIndex = Math.floor(this._scrollY / this._blockHeight);
			if (blockIndex > this._blockIndex) {
				this._blockIndex = blockIndex;
				this.refresh();
			}
			this.origin.y = this._scrollY % this._blockHeight;
		}
	}

	scrollSpeed() {
		let speed = DataManager.$gameMessage.scrollSpeed() / 2;
		if (this.isFastForward()) {
			speed *= this.fastForwardRate();
		}
		return speed;
	}

	isFastForward() {
		if (DataManager.$gameMessage.scrollNoFast()) {
			return false;
		} else {
			return (
				Input.isPressed("ok") ||
				Input.isPressed("shift") ||
				TouchInput.isPressed()
			);
		}
	}

	fastForwardRate() {
		return 3;
	}

	terminateMessage() {
		this._text = null;
		DataManager.$gameMessage.clear();
		this.hide();
	}
}
