// Window_SkillType
//
// The window for selecting a skill type on the skill screen.

import { DataManager } from '../managers/index.js';
import { Window_Command } from '../windows/index.js';

export class Window_SkillType extends Window_Command {
    constructor(rect) {
        super(rect);
        this._actor = null;
    }

    setActor(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
            this.selectLast();
        }
    }

    makeCommandList() {
        if (this._actor) {
            const skillTypes = this._actor.skillTypes();
            for (const stypeId of skillTypes) {
                const name = DataManager.$dataSystem.skillTypes[stypeId];
                this.addCommand(name, "skill", true, stypeId);
            }
        }
    }

    update() {
        super.update();
        if (this._skillWindow) {
            this._skillWindow.setStypeId(this.currentExt());
        }
    }

    setSkillWindow(skillWindow) {
        this._skillWindow = skillWindow;
    }

    selectLast() {
        const skill = this._actor.lastMenuSkill();
        if (skill) {
            this.selectExt(skill.stypeId);
        } else {
            this.forceSelect(0);
        }
    }
}
