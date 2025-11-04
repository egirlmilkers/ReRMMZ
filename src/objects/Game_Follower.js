// Game_Follower
//
// The game object class for a follower. A follower is an allied character,
// other than the front character, displayed in the party.

import { DataManager } from "../managers/DataManager.js";

import { Game_Character } from "./Game_Character.js";

export class Game_Follower extends Game_Character {
	constructor(memberIndex) {
		super();
		this._memberIndex = memberIndex;
		this.setTransparent(DataManager.$dataSystem.optTransparent);
		this.setThrough(true);
	}

	refresh() {
		const characterName = this.isVisible()
			? this.actor().characterName()
			: "";
		const characterIndex = this.isVisible()
			? this.actor().characterIndex()
			: 0;
		this.setImage(characterName, characterIndex);
	}

	actor() {
		return DataManager.$gameParty.battleMembers()[this._memberIndex];
	}

	isVisible() {
		return this.actor() && DataManager.$gamePlayer.followers().isVisible();
	}

	isGathered() {
		return (
			!this.isMoving() &&
			this.pos(DataManager.$gamePlayer.x, DataManager.$gamePlayer.y)
		);
	}

	update() {
		super.update();
		this.setMoveSpeed(DataManager.$gamePlayer.realMoveSpeed());
		this.setOpacity(DataManager.$gamePlayer.opacity());
		this.setBlendMode(DataManager.$gamePlayer.blendMode());
		this.setWalkAnime(DataManager.$gamePlayer.hasWalkAnime());
		this.setStepAnime(DataManager.$gamePlayer.hasStepAnime());
		this.setDirectionFix(DataManager.$gamePlayer.isDirectionFixed());
		this.setTransparent(DataManager.$gamePlayer.isTransparent());
	}

	chaseCharacter(character) {
		const sx = this.deltaXFrom(character.x);
		const sy = this.deltaYFrom(character.y);
		if (sx !== 0 && sy !== 0) {
			this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
		} else if (sx !== 0) {
			this.moveStraight(sx > 0 ? 4 : 6);
		} else if (sy !== 0) {
			this.moveStraight(sy > 0 ? 8 : 2);
		}
		this.setMoveSpeed(DataManager.$gamePlayer.realMoveSpeed());
	}
}
