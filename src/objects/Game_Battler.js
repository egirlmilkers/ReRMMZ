// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

import { BattleManager } from "../managers/BattleManager.js";
import { DataManager } from "../managers/DataManager.js";
import { SoundManager } from "../managers/SoundManager.js";

import { Game_Action } from "./Game_Action.js";
import { Game_ActionResult } from "./Game_ActionResult.js";
import { Game_BattlerBase } from "./Game_BattlerBase.js"; // fixes circular dependency

export class Game_Battler extends Game_BattlerBase {
	constructor() {
		super();
	}

	initMembers() {
		super.initMembers();
		this._actions = [];
		this._speed = 0;
		this._result = new Game_ActionResult();
		this._actionState = "";
		this._lastTargetIndex = 0;
		this._damagePopup = false;
		this._effectType = null;
		this._motionType = null;
		this._weaponImageId = 0;
		this._motionRefresh = false;
		this._selected = false;
		this._tpbState = "";
		this._tpbChargeTime = 0;
		this._tpbCastTime = 0;
		this._tpbIdleTime = 0;
		this._tpbTurnCount = 0;
		this._tpbTurnEnd = false;
	}

	clearDamagePopup() {
		this._damagePopup = false;
	}

	clearWeaponAnimation() {
		this._weaponImageId = 0;
	}

	clearEffect() {
		this._effectType = null;
	}

	clearMotion() {
		this._motionType = null;
		this._motionRefresh = false;
	}

	requestEffect(effectType) {
		this._effectType = effectType;
	}

	requestMotion(motionType) {
		this._motionType = motionType;
	}

	requestMotionRefresh() {
		this._motionRefresh = true;
	}

	cancelMotionRefresh() {
		this._motionRefresh = false;
	}

	select() {
		this._selected = true;
	}

	deselect() {
		this._selected = false;
	}

	isDamagePopupRequested() {
		return this._damagePopup;
	}

	isEffectRequested() {
		return !!this._effectType;
	}

	isMotionRequested() {
		return !!this._motionType;
	}

	isWeaponAnimationRequested() {
		return this._weaponImageId > 0;
	}

	isMotionRefreshRequested() {
		return this._motionRefresh;
	}

	isSelected() {
		return this._selected;
	}

	effectType() {
		return this._effectType;
	}

	motionType() {
		return this._motionType;
	}

	weaponImageId() {
		return this._weaponImageId;
	}

	startDamagePopup() {
		this._damagePopup = true;
	}

	shouldPopupDamage() {
		const result = this._result;
		return (
			result.missed ||
			result.evaded ||
			result.hpAffected ||
			result.mpDamage !== 0
		);
	}

	startWeaponAnimation(weaponImageId) {
		this._weaponImageId = weaponImageId;
	}

	action(index) {
		return this._actions[index];
	}

	setAction(index, action) {
		this._actions[index] = action;
	}

	numActions() {
		return this._actions.length;
	}

	clearActions() {
		this._actions = [];
	}

	result() {
		return this._result;
	}

	clearResult() {
		this._result.clear();
	}

	clearTpbChargeTime() {
		this._tpbState = "charging";
		this._tpbChargeTime = 0;
	}

	applyTpbPenalty() {
		this._tpbState = "charging";
		this._tpbChargeTime -= 1;
	}

	initTpbChargeTime(advantageous) {
		const speed = this.tpbRelativeSpeed();
		this._tpbState = "charging";
		this._tpbChargeTime = advantageous ? 1 : speed * Math.random() * 0.5;
		if (this.isRestricted()) {
			this._tpbChargeTime = 0;
		}
	}

	tpbChargeTime() {
		return this._tpbChargeTime;
	}

	startTpbCasting() {
		this._tpbState = "casting";
		this._tpbCastTime = 0;
	}

	startTpbAction() {
		this._tpbState = "acting";
	}

	isTpbCharged() {
		return this._tpbState === "charged";
	}

	isTpbReady() {
		return this._tpbState === "ready";
	}

	isTpbTimeout() {
		return this._tpbIdleTime >= 1;
	}

	updateTpb() {
		if (this.canMove()) {
			this.updateTpbChargeTime();
			this.updateTpbCastTime();
			this.updateTpbAutoBattle();
		}
		if (this.isAlive()) {
			this.updateTpbIdleTime();
		}
	}

	updateTpbChargeTime() {
		if (this._tpbState === "charging") {
			this._tpbChargeTime += this.tpbAcceleration();
			if (this._tpbChargeTime >= 1) {
				this._tpbChargeTime = 1;
				this.onTpbCharged();
			}
		}
	}

	updateTpbCastTime() {
		if (this._tpbState === "casting") {
			this._tpbCastTime += this.tpbAcceleration();
			if (this._tpbCastTime >= this.tpbRequiredCastTime()) {
				this._tpbCastTime = this.tpbRequiredCastTime();
				this._tpbState = "ready";
			}
		}
	}

	updateTpbAutoBattle() {
		if (
			this.isTpbCharged() &&
			!this.isTpbTurnEnd() &&
			this.isAutoBattle()
		) {
			this.makeTpbActions();
		}
	}

	updateTpbIdleTime() {
		if (!this.canMove() || this.isTpbCharged()) {
			this._tpbIdleTime += this.tpbAcceleration();
		}
	}

	tpbAcceleration() {
		const speed = this.tpbRelativeSpeed();
		const referenceTime = DataManager.$gameParty.tpbReferenceTime();
		return speed / referenceTime;
	}

	tpbRelativeSpeed() {
		return this.tpbSpeed() / DataManager.$gameParty.tpbBaseSpeed();
	}

	tpbSpeed() {
		return Math.sqrt(this.agi) + 1;
	}

	tpbBaseSpeed() {
		const baseAgility = this.paramBasePlus(6);
		return Math.sqrt(baseAgility) + 1;
	}

	tpbRequiredCastTime() {
		const actions = this._actions.filter((action) => action.isValid());
		const items = actions.map((action) => action.item());
		const delay = items.reduce(
			(r, item) => r + Math.max(0, -item.speed),
			0,
		);
		return Math.sqrt(delay) / this.tpbSpeed();
	}

	onTpbCharged() {
		if (!this.shouldDelayTpbCharge()) {
			this.finishTpbCharge();
		}
	}

	shouldDelayTpbCharge() {
		return (
			!BattleManager.isActiveTpb() && DataManager.$gameParty.canInput()
		);
	}

	finishTpbCharge() {
		this._tpbState = "charged";
		this._tpbTurnEnd = true;
		this._tpbIdleTime = 0;
	}

	isTpbTurnEnd() {
		return this._tpbTurnEnd;
	}

	initTpbTurn() {
		this._tpbTurnEnd = false;
		this._tpbTurnCount = 0;
		this._tpbIdleTime = 0;
	}

	startTpbTurn() {
		this._tpbTurnEnd = false;
		this._tpbTurnCount++;
		this._tpbIdleTime = 0;
		if (this.numActions() === 0) {
			this.makeTpbActions();
		}
	}

	makeTpbActions() {
		this.makeActions();
		if (this.canInput()) {
			this.setActionState("undecided");
		} else {
			this.startTpbCasting();
			this.setActionState("waiting");
		}
	}

	onTpbTimeout() {
		this.onAllActionsEnd();
		this._tpbTurnEnd = true;
		this._tpbIdleTime = 0;
	}

	turnCount() {
		if (BattleManager.isTpb()) {
			return this._tpbTurnCount;
		} else {
			return DataManager.$gameTroop.turnCount() + 1;
		}
	}

	canInput() {
		if (BattleManager.isTpb() && !this.isTpbCharged()) {
			return false;
		}
		return Game_BattlerBase.prototype.canInput.call(this);
	}

	refresh() {
		super.refresh();
		if (this.hp === 0) {
			this.addState(this.deathStateId());
		} else {
			this.removeState(this.deathStateId());
		}
	}

	addState(stateId) {
		if (this.isStateAddable(stateId)) {
			if (!this.isStateAffected(stateId)) {
				this.addNewState(stateId);
				this.refresh();
			}
			this.resetStateCounts(stateId);
			this._result.pushAddedState(stateId);
		}
	}

	isStateAddable(stateId) {
		return (
			this.isAlive() &&
			DataManager.$dataStates[stateId] &&
			!this.isStateResist(stateId) &&
			!this.isStateRestrict(stateId)
		);
	}

	isStateRestrict(stateId) {
		return (
			DataManager.$dataStates[stateId].removeByRestriction &&
			this.isRestricted()
		);
	}

	onRestrict() {
		super.onRestrict();
		this.clearTpbChargeTime();
		this.clearActions();
		for (const state of this.states()) {
			if (state.removeByRestriction) {
				this.removeState(state.id);
			}
		}
	}

	removeState(stateId) {
		if (this.isStateAffected(stateId)) {
			if (stateId === this.deathStateId()) {
				this.revive();
			}
			this.eraseState(stateId);
			this.refresh();
			this._result.pushRemovedState(stateId);
		}
	}

	escape() {
		if (DataManager.$gameParty.inBattle()) {
			this.hide();
		}
		this.clearActions();
		this.clearStates();
		SoundManager.playEscape();
	}

	addBuff(paramId, turns) {
		if (this.isAlive()) {
			this.increaseBuff(paramId);
			if (this.isBuffAffected(paramId)) {
				this.overwriteBuffTurns(paramId, turns);
			}
			this._result.pushAddedBuff(paramId);
			this.refresh();
		}
	}

	addDebuff(paramId, turns) {
		if (this.isAlive()) {
			this.decreaseBuff(paramId);
			if (this.isDebuffAffected(paramId)) {
				this.overwriteBuffTurns(paramId, turns);
			}
			this._result.pushAddedDebuff(paramId);
			this.refresh();
		}
	}

	removeBuff(paramId) {
		if (this.isAlive() && this.isBuffOrDebuffAffected(paramId)) {
			this.eraseBuff(paramId);
			this._result.pushRemovedBuff(paramId);
			this.refresh();
		}
	}

	removeBattleStates() {
		for (const state of this.states()) {
			if (state.removeAtBattleEnd) {
				this.removeState(state.id);
			}
		}
	}

	removeAllBuffs() {
		for (let i = 0; i < this.buffLength(); i++) {
			this.removeBuff(i);
		}
	}

	removeStatesAuto(timing) {
		for (const state of this.states()) {
			if (
				this.isStateExpired(state.id) &&
				state.autoRemovalTiming === timing
			) {
				this.removeState(state.id);
			}
		}
	}

	removeBuffsAuto() {
		for (let i = 0; i < this.buffLength(); i++) {
			if (this.isBuffExpired(i)) {
				this.removeBuff(i);
			}
		}
	}

	removeStatesByDamage() {
		for (const state of this.states()) {
			if (
				state.removeByDamage &&
				Math.randomInt(100) < state.chanceByDamage
			) {
				this.removeState(state.id);
			}
		}
	}

	makeActionTimes() {
		const actionPlusSet = this.actionPlusSet();
		return actionPlusSet.reduce(
			(r, p) => (Math.random() < p ? r + 1 : r),
			1,
		);
	}

	makeActions() {
		this.clearActions();
		if (this.canMove()) {
			const actionTimes = this.makeActionTimes();
			this._actions = [];
			for (let i = 0; i < actionTimes; i++) {
				this._actions.push(new Game_Action(this));
			}
		}
	}

	speed() {
		return this._speed;
	}

	makeSpeed() {
		this._speed =
			Math.min(...this._actions.map((action) => action.speed())) || 0;
	}

	currentAction() {
		return this._actions[0];
	}

	removeCurrentAction() {
		this._actions.shift();
	}

	setLastTarget(target) {
		this._lastTargetIndex = target ? target.index() : 0;
	}

	forceAction(skillId, targetIndex) {
		this.clearActions();
		const action = new Game_Action(this, true);
		action.setSkill(skillId);
		if (targetIndex === -2) {
			action.setTarget(this._lastTargetIndex);
		} else if (targetIndex === -1) {
			action.decideRandomTarget();
		} else {
			action.setTarget(targetIndex);
		}
		if (action.item()) {
			this._actions.push(action);
		}
	}

	useItem(item) {
		if (DataManager.isSkill(item)) {
			this.paySkillCost(item);
		} else if (DataManager.isItem(item)) {
			this.consumeItem(item);
		}
	}

	consumeItem(item) {
		DataManager.$gameParty.consumeItem(item);
	}

	gainHp(value) {
		this._result.hpDamage = -value;
		this._result.hpAffected = true;
		this.setHp(this.hp + value);
	}

	gainMp(value) {
		this._result.mpDamage = -value;
		this.setMp(this.mp + value);
	}

	gainTp(value) {
		this._result.tpDamage = -value;
		this.setTp(this.tp + value);
	}

	gainSilentTp(value) {
		this.setTp(this.tp + value);
	}

	initTp() {
		this.setTp(Math.randomInt(25));
	}

	clearTp() {
		this.setTp(0);
	}

	chargeTpByDamage(damageRate) {
		const value = Math.floor(50 * damageRate * this.tcr);
		this.gainSilentTp(value);
	}

	regenerateHp() {
		const minRecover = -this.maxSlipDamage();
		const value = Math.max(Math.floor(this.mhp * this.hrg), minRecover);
		if (value !== 0) {
			this.gainHp(value);
		}
	}

	maxSlipDamage() {
		return DataManager.$dataSystem.optSlipDeath
			? this.hp
			: Math.max(this.hp - 1, 0);
	}

	regenerateMp() {
		const value = Math.floor(this.mmp * this.mrg);
		if (value !== 0) {
			this.gainMp(value);
		}
	}

	regenerateTp() {
		const value = Math.floor(100 * this.trg);
		this.gainSilentTp(value);
	}

	regenerateAll() {
		if (this.isAlive()) {
			this.regenerateHp();
			this.regenerateMp();
			this.regenerateTp();
		}
	}

	onBattleStart(advantageous) {
		this.setActionState("undecided");
		this.clearMotion();
		this.initTpbChargeTime(advantageous);
		this.initTpbTurn();
		if (!this.isPreserveTp()) {
			this.initTp();
		}
	}

	onAllActionsEnd() {
		this.clearResult();
		this.removeStatesAuto(1);
		this.removeBuffsAuto();
	}

	onTurnEnd() {
		this.clearResult();
		this.regenerateAll();
		this.updateStateTurns();
		this.updateBuffTurns();
		this.removeStatesAuto(2);
	}

	onBattleEnd() {
		this.clearResult();
		this.removeBattleStates();
		this.removeAllBuffs();
		this.clearActions();
		if (!this.isPreserveTp()) {
			this.clearTp();
		}
		this.appear();
	}

	onDamage(value) {
		this.removeStatesByDamage();
		this.chargeTpByDamage(value / this.mhp);
	}

	setActionState(actionState) {
		this._actionState = actionState;
		this.requestMotionRefresh();
	}

	isUndecided() {
		return this._actionState === "undecided";
	}

	isInputting() {
		return this._actionState === "inputting";
	}

	isWaiting() {
		return this._actionState === "waiting";
	}

	isActing() {
		return this._actionState === "acting";
	}

	isChanting() {
		if (this.isWaiting()) {
			return this._actions.some((action) => action.isMagicSkill());
		}
		return false;
	}

	isGuardWaiting() {
		if (this.isWaiting()) {
			return this._actions.some((action) => action.isGuard());
		}
		return false;
	}

	performActionStart(action) {
		if (!action.isGuard()) {
			this.setActionState("acting");
		}
	}

	performAction() /*action*/ {
		//
	}

	performActionEnd() {
		//
	}

	performDamage() {
		//
	}

	performMiss() {
		SoundManager.playMiss();
	}

	performRecovery() {
		SoundManager.playRecovery();
	}

	performEvasion() {
		SoundManager.playEvasion();
	}

	performMagicEvasion() {
		SoundManager.playMagicEvasion();
	}

	performCounter() {
		SoundManager.playEvasion();
	}

	performReflection() {
		SoundManager.playReflection();
	}

	performSubstitute() /*target*/ {
		//
	}

	performCollapse() {
		//
	}
}
