// Window_EventItem
//
// The window used for the event command [Select Item].

import { Graphics } from "../core/Graphics.js";

import { ConfigManager } from "../managers/ConfigManager.js";
import { DataManager } from "../managers/DataManager.js";

import { Sprite_Button } from "../sprites/Sprite_Button.js";

import { Window_ItemList } from "./Window_ItemList.js";
import { Window_Selectable } from "./Window_Selectable.js";

export class Window_EventItem extends Window_ItemList {
	constructor(rect) {
		super(rect);
		this.createCancelButton();
		this.openness = 0;
		this.deactivate();
		this.setHandler("ok", this.onOk.bind(this));
		this.setHandler("cancel", this.onCancel.bind(this));
		this._canRepeat = false;
	}

	setMessageWindow(messageWindow) {
		this._messageWindow = messageWindow;
	}

	createCancelButton() {
		if (ConfigManager.touchUI) {
			this._cancelButton = new Sprite_Button("cancel");
			this._cancelButton.visible = false;
			this.addChild(this._cancelButton);
		}
	}

	start() {
		this.refresh();
		this.updatePlacement();
		this.placeCancelButton();
		this.forceSelect(0);
		this.open();
		this.activate();
	}

	update() {
		Window_Selectable.prototype.update.call(this);
		this.updateCancelButton();
	}

	updateCancelButton() {
		if (this._cancelButton) {
			this._cancelButton.visible = this.isOpen();
		}
	}

	updatePlacement() {
		if (this._messageWindow.y >= Graphics.boxHeight / 2) {
			this.y = 0;
		} else {
			this.y = Graphics.boxHeight - this.height;
		}
	}

	placeCancelButton() {
		if (this._cancelButton) {
			const spacing = 8;
			const button = this._cancelButton;
			if (this.y === 0) {
				button.y = this.height + spacing;
			} else if (this._messageWindow.y >= Graphics.boxHeight / 4) {
				const distance = this.y - this._messageWindow.y;
				button.y = -button.height - spacing - distance;
			} else {
				button.y = -button.height - spacing;
			}
			button.x = this.width - button.width - spacing;
		}
	}

	includes(item) {
		const itypeId = DataManager.$gameMessage.itemChoiceItypeId();
		return DataManager.isItem(item) && item.itypeId === itypeId;
	}

	needsNumber() {
		const itypeId = DataManager.$gameMessage.itemChoiceItypeId();
		if (itypeId === 2) {
			// Key Item
			return DataManager.$dataSystem.optKeyItemsNumber;
		} else
			return itypeId < 3; // False = Hidden Item, True = Normal Item
	}

	isEnabled() /*item*/ {
		return true;
	}

	onOk() {
		const item = this.item();
		const itemId = item ? item.id : 0;
		DataManager.$gameVariables.setValue(
			DataManager.$gameMessage.itemChoiceVariableId(),
			itemId,
		);
		this._messageWindow.terminateMessage();
		this.close();
	}

	onCancel() {
		DataManager.$gameVariables.setValue(
			DataManager.$gameMessage.itemChoiceVariableId(),
			0,
		);
		this._messageWindow.terminateMessage();
		this.close();
	}
}
