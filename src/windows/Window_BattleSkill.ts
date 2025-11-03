// Window_BattleSkill
//
// The window for selecting a skill to use on the battle screen.

import { Window_SkillList } from "../windows/index.js";

export class Window_BattleSkill extends Window_SkillList {
	constructor(rect) {
		super(rect);
		this.hide();
	}

	show() {
		this.selectLast();
		this.showHelpWindow();
		super.show();
	}

	hide() {
		this.hideHelpWindow();
		super.hide();
	}
}
