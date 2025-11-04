// Game_Followers
//
// The wrapper class for a follower array.

import { DataManager } from "../managers/DataManager";

import { Game_Follower } from "./Game_Follower";

export class Game_Followers {
	constructor() {
		this._visible = DataManager.$dataSystem.optFollowers;
		this._gathering = false;
		this._data = [];
		this.setup();
	}

	setup() {
		this._data = [];
		for (let i = 1; i < DataManager.$gameParty.maxBattleMembers(); i++) {
			this._data.push(new Game_Follower(i));
		}
	}

	isVisible() {
		return this._visible;
	}

	show() {
		this._visible = true;
	}

	hide() {
		this._visible = false;
	}

	data() {
		return [...this._data]
	}

	reverseData() {
		return this._data.clone().reverse();
	}

	follower(index) {
		return this._data[index];
	}

	refresh() {
		for (const follower of this._data) {
			follower.refresh();
		}
	}

	update() {
		if (this.areGathering()) {
			if (!this.areMoving()) {
				this.updateMove();
			}
			if (this.areGathered()) {
				this._gathering = false;
			}
		}
		for (const follower of this._data) {
			follower.update();
		}
	}

	updateMove() {
		for (let i = this._data.length - 1; i >= 0; i--) {
			const precedingCharacter =
				i > 0 ? this._data[i - 1] : DataManager.$gamePlayer;
			this._data[i].chaseCharacter(precedingCharacter);
		}
	}

	jumpAll() {
		if (DataManager.$gamePlayer.isJumping()) {
			for (const follower of this._data) {
				const sx = DataManager.$gamePlayer.deltaXFrom(follower.x);
				const sy = DataManager.$gamePlayer.deltaYFrom(follower.y);
				follower.jump(sx, sy);
			}
		}
	}

	synchronize(x, y, d) {
		for (const follower of this._data) {
			follower.locate(x, y);
			follower.setDirection(d);
		}
	}

	gather() {
		this._gathering = true;
	}

	areGathering() {
		return this._gathering;
	}

	visibleFollowers() {
		return this._data.filter((follower) => follower.isVisible());
	}

	areMoving() {
		return this.visibleFollowers().some((follower) => follower.isMoving());
	}

	areGathered() {
		return this.visibleFollowers().every((follower) =>
			follower.isGathered(),
		);
	}

	isSomeoneCollided(x, y) {
		return this.visibleFollowers().some((follower) => follower.pos(x, y));
	}
}
