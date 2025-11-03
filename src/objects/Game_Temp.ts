// Game_Temp
//
// The game object class for temporary data that is not included in save data.

import { Utils } from "../core/index.js";
import { DataManager } from "../managers/index.js";

export class Game_Temp {
	constructor() {
		this._isPlaytest = Utils.isOptionValid("test");
		this._destinationX = null;
		this._destinationY = null;
		this._touchTarget = null;
		this._touchState = "";
		this._needsBattleRefresh = false;
		this._commonEventQueue = [];
		this._animationQueue = [];
		this._balloonQueue = [];
		this._lastActionData = [0, 0, 0, 0, 0, 0];
	}

	isPlaytest() {
		return this._isPlaytest;
	}

	setDestination(x, y) {
		this._destinationX = x;
		this._destinationY = y;
	}

	clearDestination() {
		this._destinationX = null;
		this._destinationY = null;
	}

	isDestinationValid() {
		return this._destinationX !== null;
	}

	destinationX() {
		return this._destinationX;
	}

	destinationY() {
		return this._destinationY;
	}

	setTouchState(target, state) {
		this._touchTarget = target;
		this._touchState = state;
	}

	clearTouchState() {
		this._touchTarget = null;
		this._touchState = "";
	}

	touchTarget() {
		return this._touchTarget;
	}

	touchState() {
		return this._touchState;
	}

	requestBattleRefresh() {
		if (DataManager.$gameParty.inBattle()) {
			this._needsBattleRefresh = true;
		}
	}

	clearBattleRefreshRequest() {
		this._needsBattleRefresh = false;
	}

	isBattleRefreshRequested() {
		return this._needsBattleRefresh;
	}

	reserveCommonEvent(commonEventId) {
		this._commonEventQueue.push(commonEventId);
	}

	retrieveCommonEvent() {
		return DataManager.$dataCommonEvents[this._commonEventQueue.shift()];
	}

	clearCommonEventReservation() {
		this._commonEventQueue.length = 0;
	}

	isCommonEventReserved() {
		return this._commonEventQueue.length > 0;
	}

	// prettier-ignore
	requestAnimation(targets, animationId, mirror = false) {
		if (DataManager.$dataAnimations[animationId]) {
			const request = {
				targets: targets,
				animationId: animationId,
				mirror: mirror,
			};
			this._animationQueue.push(request);
			for (const target of targets) {
				if (target.startAnimation) {
					target.startAnimation();
				}
			}
		}
	}

	retrieveAnimation() {
		return this._animationQueue.shift();
	}

	requestBalloon(target, balloonId) {
		const request = { target: target, balloonId: balloonId };
		this._balloonQueue.push(request);
		if (target.startBalloon) {
			target.startBalloon();
		}
	}

	retrieveBalloon() {
		return this._balloonQueue.shift();
	}

	lastActionData(type) {
		return this._lastActionData[type] || 0;
	}

	setLastActionData(type, value) {
		this._lastActionData[type] = value;
	}

	setLastUsedSkillId(skillID) {
		this.setLastActionData(0, skillID);
	}

	setLastUsedItemId(itemID) {
		this.setLastActionData(1, itemID);
	}

	setLastSubjectActorId(actorID) {
		this.setLastActionData(2, actorID);
	}

	setLastSubjectEnemyIndex(enemyIndex) {
		this.setLastActionData(3, enemyIndex);
	}

	setLastTargetActorId(actorID) {
		this.setLastActionData(4, actorID);
	}

	setLastTargetEnemyIndex(enemyIndex) {
		this.setLastActionData(5, enemyIndex);
	}
}
