// Window_SkillStatus
//
// The window for displaying the skill user's status on the skill screen.

import { Window_StatusBase } from "../windows/index.js";

export class Window_SkillStatus extends Window_StatusBase {
	constructor(rect) {
		super(rect);
		this._actor = null;
	}

	setActor(actor) {
		if (this._actor !== actor) {
			this._actor = actor;
			this.refresh();
		}
	}

	refresh() {
		super.refresh();
		if (this._actor) {
			const x = this.colSpacing() / 2;
			const h = this.innerHeight;
			const y = h / 2 - this.lineHeight() * 1.5;
			this.drawActorFace(this._actor, x + 1, 0, 144, h);
			this.drawActorSimpleStatus(this._actor, x + 180, y);
		}
	}
}
