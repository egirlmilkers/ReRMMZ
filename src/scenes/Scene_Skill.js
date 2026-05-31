// Scene_Skill
//
// The scene class of the skill screen.

import { Graphics } from "../core/Graphics.js";
import { Rectangle } from "../core/Rectangle.js";

import { SoundManager } from "../managers/SoundManager.js";

import { Window_SkillList } from "../windows/Window_SkillList.js";
import { Window_SkillStatus } from "../windows/Window_SkillStatus.js";
import { Window_SkillType } from "../windows/Window_SkillType.js";

import { Scene_ItemBase } from "./Scene_ItemBase.js";
import { Scene_MenuBase } from "./Scene_MenuBase.js";

export class Scene_Skill extends Scene_ItemBase {
	constructor() {
		super();
	}

	create() {
		super.create();
		this.createHelpWindow();
		this.createSkillTypeWindow();
		this.createStatusWindow();
		this.createItemWindow();
		this.createActorWindow();
	}

	start() {
		super.start();
		this.refreshActor();
	}

	createSkillTypeWindow() {
		const rect = this.skillTypeWindowRect();
		this._skillTypeWindow = new Window_SkillType(rect);
		this._skillTypeWindow.setHelpWindow(this._helpWindow);
		this._skillTypeWindow.setHandler("skill", this.commandSkill.bind(this));
		this._skillTypeWindow.setHandler("cancel", this.popScene.bind(this));
		this._skillTypeWindow.setHandler("pagedown", this.nextActor.bind(this));
		this._skillTypeWindow.setHandler(
			"pageup",
			this.previousActor.bind(this),
		);
		this.addWindow(this._skillTypeWindow);
	}

	skillTypeWindowRect() {
		const ww = this.mainCommandWidth();
		const wh = this.calcWindowHeight(3, true);
		const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
		const wy = this.mainAreaTop();
		return new Rectangle(wx, wy, ww, wh);
	}

	createStatusWindow() {
		const rect = this.statusWindowRect();
		this._statusWindow = new Window_SkillStatus(rect);
		this.addWindow(this._statusWindow);
	}

	statusWindowRect() {
		const ww = Graphics.boxWidth - this.mainCommandWidth();
		const wh = this._skillTypeWindow.height;
		const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
		const wy = this.mainAreaTop();
		return new Rectangle(wx, wy, ww, wh);
	}

	createItemWindow() {
		const rect = this.itemWindowRect();
		this._itemWindow = new Window_SkillList(rect);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
		this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
		this._skillTypeWindow.setSkillWindow(this._itemWindow);
		this.addWindow(this._itemWindow);
	}

	itemWindowRect() {
		const wx = 0;
		const wy = this._statusWindow.y + this._statusWindow.height;
		const ww = Graphics.boxWidth;
		const wh = this.mainAreaHeight() - this._statusWindow.height;
		return new Rectangle(wx, wy, ww, wh);
	}

	needsPageButtons() {
		return true;
	}

	arePageButtonsEnabled() {
		return !this.isActorWindowActive();
	}

	refreshActor() {
		const actor = this.actor();
		this._skillTypeWindow.setActor(actor);
		this._statusWindow.setActor(actor);
		this._itemWindow.setActor(actor);
	}

	user() {
		return this.actor();
	}

	commandSkill() {
		this._itemWindow.activate();
		this._itemWindow.selectLast();
	}

	onItemOk() {
		this.actor().setLastMenuSkill(this.item());
		this.determineItem();
	}

	onItemCancel() {
		this._itemWindow.deselect();
		this._skillTypeWindow.activate();
	}

	playSeForItem() {
		SoundManager.playUseSkill();
	}

	useItem() {
		super.useItem();
		this._statusWindow.refresh();
		this._itemWindow.refresh();
	}

	onActorChange() {
		Scene_MenuBase.prototype.onActorChange.call(this);
		this.refreshActor();
		this._itemWindow.deselect();
		this._skillTypeWindow.activate();
	}
}
