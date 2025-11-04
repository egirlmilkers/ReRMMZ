// Window_Command
//
// The superclass of windows for selecting a command.

import { Window_Selectable } from "./Window_Selectable.js";

export class Window_Command extends Window_Selectable {
	constructor(rect) {
		super(rect);
		this.refresh();
		this.select(0);
		this.activate();
	}

	maxItems() {
		return this._list.length;
	}

	clearCommandList() {
		this._list = [];
	}

	makeCommandList() {
		//
	}

	// prettier-ignore
	addCommand(name, symbol, enabled = true, ext = null) {
        this._list.push({ name: name, symbol: symbol, enabled: enabled, ext: ext });
    }

	commandName(index) {
		return this._list[index].name;
	}

	commandSymbol(index) {
		return this._list[index].symbol;
	}

	isCommandEnabled(index) {
		return this._list[index].enabled;
	}

	currentData() {
		return this.index() >= 0 ? this._list[this.index()] : null;
	}

	isCurrentItemEnabled() {
		return this.currentData() ? this.currentData().enabled : false;
	}

	currentSymbol() {
		return this.currentData() ? this.currentData().symbol : null;
	}

	currentExt() {
		return this.currentData() ? this.currentData().ext : null;
	}

	findSymbol(symbol) {
		return this._list.findIndex((item) => item.symbol === symbol);
	}

	selectSymbol(symbol) {
		const index = this.findSymbol(symbol);
		if (index >= 0) {
			this.forceSelect(index);
		} else {
			this.forceSelect(0);
		}
	}

	findExt(ext) {
		return this._list.findIndex((item) => item.ext === ext);
	}

	selectExt(ext) {
		const index = this.findExt(ext);
		if (index >= 0) {
			this.forceSelect(index);
		} else {
			this.forceSelect(0);
		}
	}

	drawItem(index) {
		const rect = this.itemLineRect(index);
		const align = this.itemTextAlign();
		this.resetTextColor();
		this.changePaintOpacity(this.isCommandEnabled(index));
		this.drawText(
			this.commandName(index),
			rect.x,
			rect.y,
			rect.width,
			align,
		);
	}

	itemTextAlign() {
		return "center";
	}

	isOkEnabled() {
		return true;
	}

	callOkHandler() {
		const symbol = this.currentSymbol();
		if (this.isHandled(symbol)) {
			this.callHandler(symbol);
		} else if (this.isHandled("ok")) {
			super.callOkHandler();
		} else {
			this.activate();
		}
	}

	refresh() {
		this.clearCommandList();
		this.makeCommandList();
		super.refresh();
	}
}
