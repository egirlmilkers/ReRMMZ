// Window_SavefileList
//
// The window for selecting a save file on the save and load screens.

import { DataManager } from "src/managers/DataManager.js";
import { TextManager } from "src/managers/TextManager.js";

import { Window_Selectable } from "./Window_Selectable.js";

export class Window_SavefileList extends Window_Selectable {
	constructor(rect) {
		super(rect);
		this.activate();
		this._mode = null;
		this._autosave = false;
	}

	setMode(mode, autosave) {
		this._mode = mode;
		this._autosave = autosave;
		this.refresh();
	}

	maxItems() {
		return DataManager.maxSavefiles() - (this._autosave ? 0 : 1);
	}

	numVisibleRows() {
		return 5;
	}

	itemHeight() {
		return Math.floor(this.innerHeight / this.numVisibleRows());
	}

	drawItem(index) {
		const savefileId = this.indexToSavefileId(index);
		const info = DataManager.savefileInfo(savefileId);
		const rect = this.itemRectWithPadding(index);
		this.resetTextColor();
		this.changePaintOpacity(this.isEnabled(savefileId));
		this.drawTitle(savefileId, rect.x, rect.y + 4);
		if (info) {
			this.drawContents(info, rect);
		}
	}

	indexToSavefileId(index) {
		return index + (this._autosave ? 0 : 1);
	}

	savefileIdToIndex(savefileId) {
		return savefileId - (this._autosave ? 0 : 1);
	}

	isEnabled(savefileId) {
		if (this._mode === "save") {
			return savefileId > 0;
		} else {
			return !!DataManager.savefileInfo(savefileId);
		}
	}

	savefileId() {
		return this.indexToSavefileId(this.index());
	}

	selectSavefile(savefileId) {
		const index = Math.max(0, this.savefileIdToIndex(savefileId));
		this.select(index);
		this.setTopRow(index - 2);
	}

	drawTitle(savefileId, x, y) {
		if (savefileId === 0) {
			this.drawText(TextManager.autosave, x, y, 180);
		} else {
			this.drawText(TextManager.file + " " + savefileId, x, y, 180);
		}
	}

	drawContents(info, rect) {
		const bottom = rect.y + rect.height;
		if (rect.width >= 420) {
			this.drawPartyCharacters(info, rect.x + 220, bottom - 8);
		}
		const lineHeight = this.lineHeight();
		const y2 = bottom - lineHeight - 4;
		if (y2 >= lineHeight) {
			this.drawPlaytime(info, rect.x, y2, rect.width);
		}
	}

	drawPartyCharacters(info, x, y) {
		if (info.characters) {
			let characterX = x;
			for (const data of info.characters) {
				this.drawCharacter(data[0], data[1], characterX, y);
				characterX += 48;
			}
		}
	}

	drawPlaytime(info, x, y, width) {
		if (info.playtime) {
			this.drawText(info.playtime, x, y, width, "right");
		}
	}

	playOkSound() {
		//
	}
}
