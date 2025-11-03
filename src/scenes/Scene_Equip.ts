// Scene_Equip
//
// The scene class of the equipment screen.

import { Graphics, Rectangle } from "../core/index.js";
import { SoundManager } from "../managers/index.js";
import { Scene_MenuBase } from "../scenes/index.js";
import {
	Window_EquipCommand,
	Window_EquipItem,
	Window_EquipSlot,
	Window_EquipStatus,
} from "../windows/index.js";

export class Scene_Equip extends Scene_MenuBase {
	constructor() {
		super();
	}

	create() {
		super.create();
		this.createHelpWindow();
		this.createStatusWindow();
		this.createCommandWindow();
		this.createSlotWindow();
		this.createItemWindow();
		this.refreshActor();
	}

	createStatusWindow() {
		const rect = this.statusWindowRect();
		this._statusWindow = new Window_EquipStatus(rect);
		this.addWindow(this._statusWindow);
	}

	statusWindowRect() {
		const wx = 0;
		const wy = this.mainAreaTop();
		const ww = this.statusWidth();
		const wh = this.mainAreaHeight();
		return new Rectangle(wx, wy, ww, wh);
	}

	createCommandWindow() {
		const rect = this.commandWindowRect();
		this._commandWindow = new Window_EquipCommand(rect);
		this._commandWindow.setHelpWindow(this._helpWindow);
		this._commandWindow.setHandler("equip", this.commandEquip.bind(this));
		this._commandWindow.setHandler("optimize", this.commandOptimize.bind(this));
		this._commandWindow.setHandler("clear", this.commandClear.bind(this));
		this._commandWindow.setHandler("cancel", this.popScene.bind(this));
		this._commandWindow.setHandler("pagedown", this.nextActor.bind(this));
		this._commandWindow.setHandler("pageup", this.previousActor.bind(this));
		this.addWindow(this._commandWindow);
	}

	commandWindowRect() {
		const wx = this.statusWidth();
		const wy = this.mainAreaTop();
		const ww = Graphics.boxWidth - this.statusWidth();
		const wh = this.calcWindowHeight(1, true);
		return new Rectangle(wx, wy, ww, wh);
	}

	createSlotWindow() {
		const rect = this.slotWindowRect();
		this._slotWindow = new Window_EquipSlot(rect);
		this._slotWindow.setHelpWindow(this._helpWindow);
		this._slotWindow.setStatusWindow(this._statusWindow);
		this._slotWindow.setHandler("ok", this.onSlotOk.bind(this));
		this._slotWindow.setHandler("cancel", this.onSlotCancel.bind(this));
		this.addWindow(this._slotWindow);
	}

	slotWindowRect() {
		const commandWindowRect = this.commandWindowRect();
		const wx = this.statusWidth();
		const wy = commandWindowRect.y + commandWindowRect.height;
		const ww = Graphics.boxWidth - this.statusWidth();
		const wh = this.mainAreaHeight() - commandWindowRect.height;
		return new Rectangle(wx, wy, ww, wh);
	}

	createItemWindow() {
		const rect = this.itemWindowRect();
		this._itemWindow = new Window_EquipItem(rect);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setStatusWindow(this._statusWindow);
		this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
		this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
		this._itemWindow.hide();
		this._slotWindow.setItemWindow(this._itemWindow);
		this.addWindow(this._itemWindow);
	}

	itemWindowRect() {
		return this.slotWindowRect();
	}

	statusWidth() {
		return 312;
	}

	needsPageButtons() {
		return true;
	}

	arePageButtonsEnabled() {
		return !(this._itemWindow && this._itemWindow.active);
	}

	refreshActor() {
		const actor = this.actor();
		this._statusWindow.setActor(actor);
		this._slotWindow.setActor(actor);
		this._itemWindow.setActor(actor);
	}

	commandEquip() {
		this._slotWindow.activate();
		this._slotWindow.select(0);
	}

	commandOptimize() {
		SoundManager.playEquip();
		this.actor().optimizeEquipments();
		this._statusWindow.refresh();
		this._slotWindow.refresh();
		this._commandWindow.activate();
	}

	commandClear() {
		SoundManager.playEquip();
		this.actor().clearEquipments();
		this._statusWindow.refresh();
		this._slotWindow.refresh();
		this._commandWindow.activate();
	}

	onSlotOk() {
		this._slotWindow.hide();
		this._itemWindow.show();
		this._itemWindow.activate();
		this._itemWindow.forceSelect(0);
	}

	onSlotCancel() {
		this._slotWindow.deselect();
		this._commandWindow.activate();
	}

	onItemOk() {
		SoundManager.playEquip();
		this.executeEquipChange();
		this.hideItemWindow();
		this._slotWindow.refresh();
		this._itemWindow.refresh();
		this._statusWindow.refresh();
	}

	executeEquipChange() {
		const actor = this.actor();
		const slotId = this._slotWindow.index();
		const item = this._itemWindow.item();
		actor.changeEquip(slotId, item);
	}

	onItemCancel() {
		this.hideItemWindow();
	}

	onActorChange() {
		super.onActorChange();
		this.refreshActor();
		this.hideItemWindow();
		this._slotWindow.deselect();
		this._slotWindow.deactivate();
		this._commandWindow.activate();
	}

	hideItemWindow() {
		this._slotWindow.show();
		this._slotWindow.activate();
		this._itemWindow.hide();
		this._itemWindow.deselect();
	}
}
