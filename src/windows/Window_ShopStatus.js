// Window_ShopStatus
//
// The window for displaying number of items in possession and the actor's
// equipment on the shop screen.

import { Input } from "../core/Input.js";
import { TouchInput } from "../core/TouchInput.js";

import { ColorManager } from "../managers/ColorManager.js";
import { DataManager } from "../managers/DataManager.js";
import { TextManager } from "../managers/TextManager.js";

import { Window_StatusBase } from "./Window_StatusBase.js";

export class Window_ShopStatus extends Window_StatusBase {
	constructor(rect) {
		super(rect);
		this._item = null;
		this._pageIndex = 0;
		this.refresh();
	}

	refresh() {
		this.contents.clear();
		if (this._item) {
			const x = this.itemPadding();
			this.drawPossession(x, 0);
			if (this.isEquipItem()) {
				const y = Math.floor(this.lineHeight() * 1.5);
				this.drawEquipInfo(x, y);
			}
		}
	}

	setItem(item) {
		this._item = item;
		this.refresh();
	}

	isEquipItem() {
		return (
			DataManager.isWeapon(this._item) || DataManager.isArmor(this._item)
		);
	}

	drawPossession(x, y) {
		const width = this.innerWidth - this.itemPadding() - x;
		const possessionWidth = this.textWidth("0000");
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(TextManager.possession, x, y, width - possessionWidth);
		this.resetTextColor();
		this.drawText(
			DataManager.$gameParty.numItems(this._item),
			x,
			y,
			width,
			"right",
		);
	}

	drawEquipInfo(x, y) {
		const members = this.statusMembers();
		for (let i = 0; i < members.length; i++) {
			const actorY = y + Math.floor(this.lineHeight() * i * 2.2);
			this.drawActorEquipInfo(x, actorY, members[i]);
		}
	}

	statusMembers() {
		const start = this._pageIndex * this.pageSize();
		const end = start + this.pageSize();
		return DataManager.$gameParty.members().slice(start, end);
	}

	pageSize() {
		return 4;
	}

	maxPages() {
		return Math.floor(
			(DataManager.$gameParty.size() + this.pageSize() - 1) /
				this.pageSize(),
		);
	}

	drawActorEquipInfo(x, y, actor) {
		const item1 = this.currentEquippedItem(actor, this._item.etypeId);
		const width = this.innerWidth - x - this.itemPadding();
		const enabled = actor.canEquip(this._item);
		this.changePaintOpacity(enabled);
		this.resetTextColor();
		this.drawText(actor.name(), x, y, width);
		if (enabled) {
			this.drawActorParamChange(x, y, actor, item1);
		}
		this.drawItemName(item1, x, y + this.lineHeight(), width);
		this.changePaintOpacity(true);
	}

	// prettier-ignore
	drawActorParamChange(x, y, actor, item1) {
        const width = this.innerWidth - this.itemPadding() - x;
        const paramId = this.paramId();
        const change =
            this._item.params[paramId] - (item1 ? item1.params[paramId] : 0);
        this.changeTextColor(ColorManager.paramchangeTextColor(change));
        this.drawText((change > 0 ? "+" : "") + change, x, y, width, "right");
    }

	paramId() {
		return DataManager.isWeapon(this._item) ? 2 : 3;
	}

	currentEquippedItem(actor, etypeId) {
		const list = [];
		const equips = actor.equips();
		const slots = actor.equipSlots();
		for (let i = 0; i < slots.length; i++) {
			if (slots[i] === etypeId) {
				list.push(equips[i]);
			}
		}
		const paramId = this.paramId();
		let worstParam = Number.MAX_VALUE;
		let worstItem = null;
		for (const item of list) {
			if (item && item.params[paramId] < worstParam) {
				worstParam = item.params[paramId];
				worstItem = item;
			}
		}
		return worstItem;
	}

	update() {
		super.update();
		this.updatePage();
	}

	updatePage() {
		if (this.isPageChangeEnabled() && this.isPageChangeRequested()) {
			this.changePage();
		}
	}

	isPageChangeEnabled() {
		return this.visible && this.maxPages() >= 2;
	}

	isPageChangeRequested() {
		if (Input.isTriggered("shift")) return true;

		return TouchInput.isTriggered() && this.isTouchedInsideFrame();
	}

	changePage() {
		this._pageIndex = (this._pageIndex + 1) % this.maxPages();
		this.refresh();
		this.playCursorSound();
	}
}
