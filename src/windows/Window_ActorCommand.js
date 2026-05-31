// Window_ActorCommand
//
// The window for selecting an actor's action on the battle screen.

import { ConfigManager } from "../managers/ConfigManager.js";
import { DataManager } from "../managers/DataManager.js";
import { TextManager } from "../managers/TextManager.js";

import { Window_Command } from "./Window_Command.js";

export class Window_ActorCommand extends Window_Command {
	constructor(rect) {
		super(rect);
		this.openness = 0;
		this.deactivate();
		this._actor = null;
	}

	makeCommandList() {
		if (this._actor) {
			this.addAttackCommand();
			this.addSkillCommands();
			this.addGuardCommand();
			this.addItemCommand();
		}
	}

	addAttackCommand() {
		this.addCommand(TextManager.attack, "attack", this._actor.canAttack());
	}

	addSkillCommands() {
		const skillTypes = this._actor.skillTypes();
		for (const stypeId of skillTypes) {
			const name = DataManager.$dataSystem.skillTypes[stypeId];
			this.addCommand(name, "skill", true, stypeId);
		}
	}

	addGuardCommand() {
		this.addCommand(TextManager.guard, "guard", this._actor.canGuard());
	}

	addItemCommand() {
		this.addCommand(TextManager.item, "item");
	}

	setup(actor) {
		this._actor = actor;
		this.refresh();
		this.selectLast();
		this.activate();
		this.open();
	}

	actor() {
		return this._actor;
	}

	processOk() {
		if (this._actor) {
			if (ConfigManager.commandRemember) {
				this._actor.setLastCommandSymbol(this.currentSymbol());
			} else {
				this._actor.setLastCommandSymbol("");
			}
		}
		super.processOk();
	}

	selectLast() {
		this.forceSelect(0);
		if (this._actor && ConfigManager.commandRemember) {
			const symbol = this._actor.lastCommandSymbol();
			this.selectSymbol(symbol);
			if (symbol === "skill") {
				const skill = this._actor.lastBattleSkill();
				if (skill) {
					this.selectExt(skill.stypeId);
				}
			}
		}
	}
}
