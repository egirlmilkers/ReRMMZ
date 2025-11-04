// Window_DebugEdit
//
// The window for displaying switches and variables on the debug screen.

import { Input } from "../core/Input.js";

import { DataManager } from "../managers/DataManager.js";

import { Window_Selectable } from "./Window_Selectable.js";

export class Window_DebugEdit extends Window_Selectable {
	constructor(rect) {
		super(rect);
		this._mode = "switch";
		this._topId = 1;
		this.refresh();
	}

	maxItems() {
		return 10;
	}

	drawItem(index) {
		const dataId = this._topId + index;
		const idText = dataId.padZero(4) + ":";
		const idWidth = this.textWidth(idText);
		const statusWidth = this.textWidth("-00000000");
		const name = this.itemName(dataId);
		const status = this.itemStatus(dataId);
		const rect = this.itemLineRect(index);
		this.resetTextColor();
		this.drawText(idText, rect.x, rect.y, rect.width);
		rect.x += idWidth;
		rect.width -= idWidth + statusWidth;
		this.drawText(name, rect.x, rect.y, rect.width);
		this.drawText(
			status,
			rect.x + rect.width,
			rect.y,
			statusWidth,
			"right",
		);
	}

	itemName(dataId) {
		if (this._mode === "switch") {
			return DataManager.$dataSystem.switches[dataId];
		} else {
			return DataManager.$dataSystem.variables[dataId];
		}
	}

	itemStatus(dataId) {
		if (this._mode === "switch") {
			return DataManager.$gameSwitches.value(dataId) ? "[ON]" : "[OFF]";
		} else {
			return String(DataManager.$gameVariables.value(dataId));
		}
	}

	setMode(mode) {
		if (this._mode !== mode) {
			this._mode = mode;
			this.refresh();
		}
	}

	setTopId(id) {
		if (this._topId !== id) {
			this._topId = id;
			this.refresh();
		}
	}

	currentId() {
		return this._topId + this.index();
	}

	update() {
		super.update();
		if (this.active) {
			if (this._mode === "switch") {
				this.updateSwitch();
			} else {
				this.updateVariable();
			}
		}
	}

	updateSwitch() {
		if (Input.isRepeated("ok")) {
			const switchId = this.currentId();
			this.playCursorSound();
			DataManager.$gameSwitches.setValue(
				switchId,
				!DataManager.$gameSwitches.value(switchId),
			);
			this.redrawCurrentItem();
		}
	}

	updateVariable() {
		const variableId = this.currentId();
		const value = DataManager.$gameVariables.value(variableId);
		if (typeof value === "number") {
			const newValue = value + this.deltaForVariable();
			if (value !== newValue) {
				DataManager.$gameVariables.setValue(variableId, newValue);
				this.playCursorSound();
				this.redrawCurrentItem();
			}
		}
	}

	deltaForVariable() {
		if (Input.isRepeated("right")) {
			return 1;
		} else if (Input.isRepeated("left")) {
			return -1;
		} else if (Input.isRepeated("pagedown")) {
			return 10;
		} else if (Input.isRepeated("pageup")) {
			return -10;
		}
		return 0;
	}
}
