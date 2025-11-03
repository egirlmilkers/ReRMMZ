// Window_BattleActor
//
// The window for selecting a target actor on the battle screen.

import { DataManager } from '../managers/index.js';
import { Window_BattleStatus } from '../windows/index.js';

export function Window_BattleActor(rect) {
	Window_BattleStatus.call(this, rect);
	this.openness = 255;
	this.hide();
};

Window_BattleActor.prototype = Object.create(Window_BattleStatus.prototype);
Window_BattleActor.prototype.constructor = Window_BattleActor;

Window_BattleActor.prototype.show = function () {
	this.forceSelect(0);
	DataManager.$gameTemp.clearTouchState();
	Window_BattleStatus.prototype.show.call(this);
};

Window_BattleActor.prototype.hide = function () {
	Window_BattleStatus.prototype.hide.call(this);
	DataManager.$gameParty.select(null);
};

Window_BattleActor.prototype.select = function (index) {
	Window_BattleStatus.prototype.select.call(this, index);
	DataManager.$gameParty.select(this.actor(index));
};

Window_BattleActor.prototype.processTouch = function () {
	Window_BattleStatus.prototype.processTouch.call(this);
	if (this.isOpenAndActive()) {
		const target = DataManager.$gameTemp.touchTarget();
		if (target) {
			const members = DataManager.$gameParty.battleMembers();
			if (members.includes(target)) {
				this.select(members.indexOf(target));
				if (DataManager.$gameTemp.touchState() === "click") {
					this.processOk();
				}
			}
			DataManager.$gameTemp.clearTouchState();
		}
	}
};
