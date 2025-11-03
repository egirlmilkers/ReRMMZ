// BattleManager
//
// The static class that manages battle progress.

import {
	AudioManager,
	DataManager,
	SceneManager,
	SoundManager,
	TextManager,
} from "../managers/index.js";
import { Game_Action } from "../objects/index.js";
import { Scene_Gameover } from "../scenes/index.js";

export class BattleManager {
	constructor() {
		throw new Error("This is a static class");
	}

	static setup(troopId, canEscape, canLose) {
		BattleManager.initMembers();
		BattleManager._canEscape = canEscape;
		BattleManager._canLose = canLose;
		DataManager.$gameTroop.setup(troopId);
		DataManager.$gameScreen.onBattleStart();
		BattleManager.makeEscapeRatio();
	}

	static initMembers() {
		BattleManager._phase = "";
		BattleManager._inputting = false;
		BattleManager._canEscape = false;
		BattleManager._canLose = false;
		BattleManager._battleTest = false;
		BattleManager._eventCallback = null;
		BattleManager._preemptive = false;
		BattleManager._surprise = false;
		BattleManager._currentActor = null;
		BattleManager._actionForcedBattler = null;
		BattleManager._mapBgm = null;
		BattleManager._mapBgs = null;
		BattleManager._actionBattlers = [];
		BattleManager._subject = null;
		BattleManager._action = null;
		BattleManager._targets = [];
		BattleManager._logWindow = null;
		BattleManager._spriteset = null;
		BattleManager._escapeRatio = 0;
		BattleManager._escaped = false;
		BattleManager._rewards = {};
		BattleManager._tpbNeedsPartyCommand = true;
	}

	static isTpb() {
		return DataManager.$dataSystem.battleSystem >= 1;
	}

	static isActiveTpb() {
		return DataManager.$dataSystem.battleSystem === 1;
	}

	static isBattleTest() {
		return BattleManager._battleTest;
	}

	static setBattleTest(battleTest) {
		BattleManager._battleTest = battleTest;
	}

	static setEventCallback(callback) {
		BattleManager._eventCallback = callback;
	}

	static setLogWindow(logWindow) {
		BattleManager._logWindow = logWindow;
	}

	static setSpriteset(spriteset) {
		BattleManager._spriteset = spriteset;
	}

	static onEncounter() {
		BattleManager._preemptive = Math.random() < BattleManager.ratePreemptive();
		BattleManager._surprise =
			Math.random() < BattleManager.rateSurprise() &&
			!BattleManager._preemptive;
	}

	static ratePreemptive() {
		return DataManager.$gameParty.ratePreemptive(
			DataManager.$gameTroop.agility(),
		);
	}

	static rateSurprise() {
		return DataManager.$gameParty.rateSurprise(
			DataManager.$gameTroop.agility(),
		);
	}

	static saveBgmAndBgs() {
		BattleManager._mapBgm = AudioManager.saveBgm();
		BattleManager._mapBgs = AudioManager.saveBgs();
	}

	static playBattleBgm() {
		AudioManager.playBgm(DataManager.$gameSystem.battleBgm());
		AudioManager.stopBgs();
	}

	static playVictoryMe() {
		AudioManager.playMe(DataManager.$gameSystem.victoryMe());
	}

	static playDefeatMe() {
		AudioManager.playMe(DataManager.$gameSystem.defeatMe());
	}

	static replayBgmAndBgs() {
		if (BattleManager._mapBgm) {
			AudioManager.replayBgm(BattleManager._mapBgm);
		} else {
			AudioManager.stopBgm();
		}
		if (BattleManager._mapBgs) {
			AudioManager.replayBgs(BattleManager._mapBgs);
		}
	}

	static makeEscapeRatio() {
		BattleManager._escapeRatio =
			(0.5 * DataManager.$gameParty.agility()) /
			DataManager.$gameTroop.agility();
	}

	static update(timeActive) {
		if (!BattleManager.isBusy() && !BattleManager.updateEvent()) {
			BattleManager.updatePhase(timeActive);
		}
		if (BattleManager.isTpb()) {
			BattleManager.updateTpbInput();
		}
	}

	static updatePhase(timeActive) {
		switch (BattleManager._phase) {
			case "start":
				BattleManager.updateStart();
				break;
			case "turn":
				BattleManager.updateTurn(timeActive);
				break;
			case "action":
				BattleManager.updateAction();
				break;
			case "turnEnd":
				BattleManager.updateTurnEnd();
				break;
			case "battleEnd":
				BattleManager.updateBattleEnd();
				break;
		}
	}

	static updateEvent() {
		switch (BattleManager._phase) {
			case "start":
			case "turn":
			case "turnEnd":
				if (BattleManager.isActionForced()) {
					BattleManager.processForcedAction();
					return true;
				} else {
					return BattleManager.updateEventMain();
				}
		}
		return BattleManager.checkAbort();
	}

	static updateEventMain() {
		DataManager.$gameTroop.updateInterpreter();
		DataManager.$gameParty.requestMotionRefresh();
		if (
			DataManager.$gameTroop.isEventRunning() ||
			BattleManager.checkBattleEnd()
		) {
			return true;
		}
		DataManager.$gameTroop.setupBattleEvent();
		if (
			DataManager.$gameTroop.isEventRunning() ||
			SceneManager.isSceneChanging()
		) {
			return true;
		}
		return false;
	}

	static isBusy() {
		return (
			DataManager.$gameMessage.isBusy() ||
			BattleManager._spriteset.isBusy() ||
			BattleManager._logWindow.isBusy()
		);
	}

	static updateTpbInput() {
		if (BattleManager._inputting) {
			BattleManager.checkTpbInputClose();
		} else {
			BattleManager.checkTpbInputOpen();
		}
	}

	static checkTpbInputClose() {
		if (
			!BattleManager.isPartyTpbInputtable() ||
			BattleManager.needsActorInputCancel()
		) {
			BattleManager.cancelActorInput();
			BattleManager._currentActor = null;
			BattleManager._inputting = false;
		}
	}

	static checkTpbInputOpen() {
		if (BattleManager.isPartyTpbInputtable()) {
			if (BattleManager._tpbNeedsPartyCommand) {
				BattleManager._inputting = true;
				BattleManager._tpbNeedsPartyCommand = false;
			} else {
				BattleManager.selectNextCommand();
			}
		}
	}

	static isPartyTpbInputtable() {
		return DataManager.$gameParty.canInput() && BattleManager.isTpbMainPhase();
	}

	static needsActorInputCancel() {
		return (
			BattleManager._currentActor && !BattleManager._currentActor.canInput()
		);
	}

	static isTpbMainPhase() {
		return ["turn", "turnEnd", "action"].includes(BattleManager._phase);
	}

	static isInputting() {
		return BattleManager._inputting;
	}

	static isInTurn() {
		return BattleManager._phase === "turn";
	}

	static isTurnEnd() {
		return BattleManager._phase === "turnEnd";
	}

	static isAborting() {
		return BattleManager._phase === "aborting";
	}

	static isBattleEnd() {
		return BattleManager._phase === "battleEnd";
	}

	static canEscape() {
		return BattleManager._canEscape;
	}

	static canLose() {
		return BattleManager._canLose;
	}

	static isEscaped() {
		return BattleManager._escaped;
	}

	static actor() {
		return BattleManager._currentActor;
	}

	static startBattle() {
		BattleManager._phase = "start";
		DataManager.$gameSystem.onBattleStart();
		DataManager.$gameParty.onBattleStart(BattleManager._preemptive);
		DataManager.$gameTroop.onBattleStart(BattleManager._surprise);
		BattleManager.displayStartMessages();
	}

	static displayStartMessages() {
		for (const name of DataManager.$gameTroop.enemyNames()) {
			DataManager.$gameMessage.add(TextManager.emerge.format(name));
		}
		if (BattleManager._preemptive) {
			DataManager.$gameMessage.add(
				TextManager.preemptive.format(DataManager.$gameParty.name()),
			);
		} else if (BattleManager._surprise) {
			DataManager.$gameMessage.add(
				TextManager.surprise.format(DataManager.$gameParty.name()),
			);
		}
	}

	static startInput() {
		BattleManager._phase = "input";
		BattleManager._inputting = true;
		DataManager.$gameParty.makeActions();
		DataManager.$gameTroop.makeActions();
		BattleManager._currentActor = null;
		if (BattleManager._surprise || !DataManager.$gameParty.canInput()) {
			BattleManager.startTurn();
		}
	}

	static inputtingAction() {
		return BattleManager._currentActor
			? BattleManager._currentActor.inputtingAction()
			: null;
	}

	static selectNextCommand() {
		if (BattleManager._currentActor) {
			if (BattleManager._currentActor.selectNextCommand()) {
				return;
			}
			BattleManager.finishActorInput();
		}
		BattleManager.selectNextActor();
	}

	static selectNextActor() {
		BattleManager.changeCurrentActor(true);
		if (!BattleManager._currentActor) {
			if (BattleManager.isTpb()) {
				BattleManager.changeCurrentActor(true);
			} else {
				BattleManager.startTurn();
			}
		}
	}

	static selectPreviousCommand() {
		if (BattleManager._currentActor) {
			if (BattleManager._currentActor.selectPreviousCommand()) {
				return;
			}
			BattleManager.cancelActorInput();
		}
		BattleManager.selectPreviousActor();
	}

	static selectPreviousActor() {
		if (BattleManager.isTpb()) {
			BattleManager.changeCurrentActor(true);
			if (!BattleManager._currentActor) {
				BattleManager._inputting = DataManager.$gameParty.canInput();
			}
		} else {
			BattleManager.changeCurrentActor(false);
		}
	}

	static changeCurrentActor(forward) {
		const members = DataManager.$gameParty.battleMembers();
		let actor = BattleManager._currentActor;
		for (;;) {
			const currentIndex = members.indexOf(actor);
			actor = members[currentIndex + (forward ? 1 : -1)];
			if (!actor || actor.canInput()) {
				break;
			}
		}
		BattleManager._currentActor = actor ? actor : null;
		BattleManager.startActorInput();
	}

	static startActorInput() {
		if (BattleManager._currentActor) {
			BattleManager._currentActor.setActionState("inputting");
			BattleManager._inputting = true;
		}
	}

	static finishActorInput() {
		if (BattleManager._currentActor) {
			if (BattleManager.isTpb()) {
				BattleManager._currentActor.startTpbCasting();
			}
			BattleManager._currentActor.setActionState("waiting");
		}
	}

	static cancelActorInput() {
		if (BattleManager._currentActor) {
			BattleManager._currentActor.setActionState("undecided");
		}
	}

	static updateStart() {
		if (BattleManager.isTpb()) {
			BattleManager._phase = "turn";
		} else {
			BattleManager.startInput();
		}
	}

	static startTurn() {
		BattleManager._phase = "turn";
		DataManager.$gameTroop.increaseTurn();
		DataManager.$gameParty.requestMotionRefresh();
		if (!BattleManager.isTpb()) {
			BattleManager.makeActionOrders();
			BattleManager._logWindow.startTurn();
			BattleManager._inputting = false;
		}
	}

	static updateTurn(timeActive) {
		DataManager.$gameParty.requestMotionRefresh();
		if (BattleManager.isTpb() && timeActive) {
			BattleManager.updateTpb();
		}
		if (!BattleManager._subject) {
			BattleManager._subject = BattleManager.getNextSubject();
		}
		if (BattleManager._subject) {
			BattleManager.processTurn();
		} else if (!BattleManager.isTpb()) {
			BattleManager.endTurn();
		}
	}

	static updateTpb() {
		DataManager.$gameParty.updateTpb();
		DataManager.$gameTroop.updateTpb();
		BattleManager.updateAllTpbBattlers();
		BattleManager.checkTpbTurnEnd();
	}

	static updateAllTpbBattlers() {
		for (const battler of BattleManager.allBattleMembers()) {
			BattleManager.updateTpbBattler(battler);
		}
	}

	static updateTpbBattler(battler) {
		if (battler.isTpbTurnEnd()) {
			battler.onTurnEnd();
			battler.startTpbTurn();
			BattleManager.displayBattlerStatus(battler, false);
		} else if (battler.isTpbReady()) {
			battler.startTpbAction();
			BattleManager._actionBattlers.push(battler);
		} else if (battler.isTpbTimeout()) {
			battler.onTpbTimeout();
			BattleManager.displayBattlerStatus(battler, true);
		}
	}

	static checkTpbTurnEnd() {
		if (DataManager.$gameTroop.isTpbTurnEnd()) {
			BattleManager.endTurn();
		}
	}

	static processTurn() {
		const subject = BattleManager._subject;
		const action = subject.currentAction();
		if (action) {
			action.prepare();
			if (action.isValid()) {
				BattleManager.startAction();
			}
			subject.removeCurrentAction();
		} else {
			BattleManager.endAction();
			BattleManager._subject = null;
		}
	}

	static endBattlerActions(battler) {
		battler.setActionState(BattleManager.isTpb() ? "undecided" : "done");
		battler.onAllActionsEnd();
		battler.clearTpbChargeTime();
		BattleManager.displayBattlerStatus(battler, true);
	}

	static endTurn() {
		BattleManager._phase = "turnEnd";
		BattleManager._preemptive = false;
		BattleManager._surprise = false;
	}

	static updateTurnEnd() {
		if (BattleManager.isTpb()) {
			BattleManager.startTurn();
		} else {
			BattleManager.endAllBattlersTurn();
			BattleManager._phase = "start";
		}
	}

	static endAllBattlersTurn() {
		for (const battler of BattleManager.allBattleMembers()) {
			battler.onTurnEnd();
			BattleManager.displayBattlerStatus(battler, false);
		}
	}

	static displayBattlerStatus(battler, current) {
		BattleManager._logWindow.displayAutoAffectedStatus(battler);
		if (current) {
			BattleManager._logWindow.displayCurrentState(battler);
		}
		BattleManager._logWindow.displayRegeneration(battler);
	}

	static getNextSubject() {
		for (;;) {
			const battler = BattleManager._actionBattlers.shift();
			if (!battler) {
				return null;
			}
			if (battler.isBattleMember() && battler.isAlive()) {
				return battler;
			}
		}
	}

	static allBattleMembers() {
		return DataManager.$gameParty
			.battleMembers()
			.concat(DataManager.$gameTroop.members());
	}

	static makeActionOrders() {
		const battlers = [];
		if (!BattleManager._surprise) {
			battlers.push(...DataManager.$gameParty.battleMembers());
		}
		if (!BattleManager._preemptive) {
			battlers.push(...DataManager.$gameTroop.members());
		}
		for (const battler of battlers) {
			battler.makeSpeed();
		}
		battlers.sort((a, b) => b.speed() - a.speed());
		BattleManager._actionBattlers = battlers;
	}

	static startAction() {
		const subject = BattleManager._subject;
		const action = subject.currentAction();
		const targets = action.makeTargets();
		BattleManager._phase = "action";
		BattleManager._action = action;
		BattleManager._targets = targets;
		subject.cancelMotionRefresh();
		subject.useItem(action.item());
		BattleManager._action.applyGlobal();
		BattleManager._logWindow.startAction(subject, action, targets);
	}

	static updateAction() {
		const target = BattleManager._targets.shift();
		if (target) {
			BattleManager.invokeAction(BattleManager._subject, target);
		} else {
			BattleManager.endAction();
		}
	}

	static endAction() {
		BattleManager._logWindow.endAction(BattleManager._subject);
		BattleManager._phase = "turn";
		if (BattleManager._subject.numActions() === 0) {
			BattleManager.endBattlerActions(BattleManager._subject);
			BattleManager._subject = null;
		}
	}

	static invokeAction(subject, target) {
		BattleManager._logWindow.push("pushBaseLine");
		if (Math.random() < BattleManager._action.itemCnt(target)) {
			BattleManager.invokeCounterAttack(subject, target);
		} else if (Math.random() < BattleManager._action.itemMrf(target)) {
			BattleManager.invokeMagicReflection(subject, target);
		} else {
			BattleManager.invokeNormalAction(subject, target);
		}
		subject.setLastTarget(target);
		BattleManager._logWindow.push("popBaseLine");
	}

	static invokeNormalAction(subject, target) {
		const realTarget = BattleManager.applySubstitute(target);
		BattleManager._action.apply(realTarget);
		BattleManager._logWindow.displayActionResults(subject, realTarget);
	}

	static invokeCounterAttack(subject, target) {
		const action = new Game_Action(target);
		action.setAttack();
		action.apply(subject);
		BattleManager._logWindow.displayCounter(target);
		BattleManager._logWindow.displayActionResults(target, subject);
	}

	static invokeMagicReflection(subject, target) {
		BattleManager._action._reflectionTarget = target;
		BattleManager._logWindow.displayReflection(target);
		BattleManager._action.apply(subject);
		BattleManager._logWindow.displayActionResults(target, subject);
	}

	static applySubstitute(target) {
		if (BattleManager.checkSubstitute(target)) {
			const substitute = target.friendsUnit().substituteBattler(target);
			if (substitute) {
				BattleManager._logWindow.displaySubstitute(substitute, target);
				return substitute;
			}
		}
		return target;
	}

	static checkSubstitute(target) {
		return target.isDying() && !BattleManager._action.isCertainHit();
	}

	static isActionForced() {
		return (
			!!BattleManager._actionForcedBattler &&
			!DataManager.$gameParty.isAllDead() &&
			!DataManager.$gameTroop.isAllDead()
		);
	}

	static forceAction(battler) {
		if (battler.numActions() > 0) {
			BattleManager._actionForcedBattler = battler;
			BattleManager._actionBattlers.remove(battler);
		}
	}

	static processForcedAction() {
		if (BattleManager._actionForcedBattler) {
			if (BattleManager._subject) {
				BattleManager.endBattlerActions(BattleManager._subject);
			}
			BattleManager._subject = BattleManager._actionForcedBattler;
			BattleManager._actionForcedBattler = null;
			BattleManager.startAction();
			BattleManager._subject.removeCurrentAction();
		}
	}

	static abort() {
		BattleManager._phase = "aborting";
	}

	static checkBattleEnd() {
		if (BattleManager._phase) {
			if (DataManager.$gameParty.isEscaped()) {
				BattleManager.processPartyEscape();
				return true;
			} else if (DataManager.$gameParty.isAllDead()) {
				BattleManager.processDefeat();
				return true;
			} else if (DataManager.$gameTroop.isAllDead()) {
				BattleManager.processVictory();
				return true;
			}
		}
		return false;
	}

	static checkAbort() {
		if (BattleManager.isAborting()) {
			BattleManager.processAbort();
			return true;
		}
		return false;
	}

	static processVictory() {
		DataManager.$gameParty.removeBattleStates();
		DataManager.$gameParty.performVictory();
		BattleManager.playVictoryMe();
		BattleManager.replayBgmAndBgs();
		BattleManager.makeRewards();
		BattleManager.displayVictoryMessage();
		BattleManager.displayRewards();
		BattleManager.gainRewards();
		BattleManager.endBattle(0);
	}

	static processEscape() {
		DataManager.$gameParty.performEscape();
		SoundManager.playEscape();
		const success =
			BattleManager._preemptive || Math.random() < BattleManager._escapeRatio;
		if (success) {
			BattleManager.onEscapeSuccess();
		} else {
			BattleManager.onEscapeFailure();
		}
		return success;
	}

	static onEscapeSuccess() {
		BattleManager.displayEscapeSuccessMessage();
		BattleManager._escaped = true;
		BattleManager.processAbort();
	}

	static onEscapeFailure() {
		DataManager.$gameParty.onEscapeFailure();
		BattleManager.displayEscapeFailureMessage();
		BattleManager._escapeRatio += 0.1;
		if (!BattleManager.isTpb()) {
			BattleManager.startTurn();
		}
	}

	static processPartyEscape() {
		BattleManager._escaped = true;
		BattleManager.processAbort();
	}

	static processAbort() {
		DataManager.$gameParty.removeBattleStates();
		BattleManager._logWindow.clear();
		BattleManager.replayBgmAndBgs();
		BattleManager.endBattle(1);
	}

	static processDefeat() {
		BattleManager.displayDefeatMessage();
		BattleManager.playDefeatMe();
		if (BattleManager._canLose) {
			BattleManager.replayBgmAndBgs();
		} else {
			AudioManager.stopBgm();
		}
		BattleManager.endBattle(2);
	}

	static endBattle(result) {
		BattleManager._phase = "battleEnd";
		BattleManager.cancelActorInput();
		BattleManager._inputting = false;
		if (BattleManager._eventCallback) {
			BattleManager._eventCallback(result);
		}
		if (result === 0) {
			DataManager.$gameSystem.onBattleWin();
		} else if (BattleManager._escaped) {
			DataManager.$gameSystem.onBattleEscape();
		}
		DataManager.$gameTemp.clearCommonEventReservation();
	}

	static updateBattleEnd() {
		if (BattleManager.isBattleTest()) {
			AudioManager.stopBgm();
			SceneManager.exit();
		} else if (!BattleManager._escaped && DataManager.$gameParty.isAllDead()) {
			if (BattleManager._canLose) {
				DataManager.$gameParty.reviveBattleMembers();
				SceneManager.pop();
			} else {
				SceneManager.goto(Scene_Gameover);
			}
		} else {
			SceneManager.pop();
		}
		BattleManager._phase = "";
	}

	static makeRewards() {
		BattleManager._rewards = {
			gold: DataManager.$gameTroop.goldTotal(),
			exp: DataManager.$gameTroop.expTotal(),
			items: DataManager.$gameTroop.makeDropItems(),
		};
	}

	static displayVictoryMessage() {
		DataManager.$gameMessage.add(
			TextManager.victory.format(DataManager.$gameParty.name()),
		);
	}

	static displayDefeatMessage() {
		DataManager.$gameMessage.add(
			TextManager.defeat.format(DataManager.$gameParty.name()),
		);
	}

	static displayEscapeSuccessMessage() {
		DataManager.$gameMessage.add(
			TextManager.escapeStart.format(DataManager.$gameParty.name()),
		);
	}

	static displayEscapeFailureMessage() {
		DataManager.$gameMessage.add(
			TextManager.escapeStart.format(DataManager.$gameParty.name()),
		);
		DataManager.$gameMessage.add("\\." + TextManager.escapeFailure);
	}

	static displayRewards() {
		BattleManager.displayExp();
		BattleManager.displayGold();
		BattleManager.displayDropItems();
	}

	static displayExp() {
		const exp = BattleManager._rewards.exp;
		if (exp > 0) {
			const text = TextManager.obtainExp.format(exp, TextManager.exp);
			DataManager.$gameMessage.add("\\." + text);
		}
	}

	static displayGold() {
		const gold = BattleManager._rewards.gold;
		if (gold > 0) {
			DataManager.$gameMessage.add("\\." + TextManager.obtainGold.format(gold));
		}
	}

	static displayDropItems() {
		const items = BattleManager._rewards.items;
		if (items.length > 0) {
			DataManager.$gameMessage.newPage();
			for (const item of items) {
				DataManager.$gameMessage.add(TextManager.obtainItem.format(item.name));
			}
		}
	}

	static gainRewards() {
		BattleManager.gainExp();
		BattleManager.gainGold();
		BattleManager.gainDropItems();
	}

	static gainExp() {
		const exp = BattleManager._rewards.exp;
		for (const actor of DataManager.$gameParty.allMembers()) {
			actor.gainExp(exp);
		}
	}

	static gainGold() {
		DataManager.$gameParty.gainGold(BattleManager._rewards.gold);
	}

	static gainDropItems() {
		const items = BattleManager._rewards.items;
		for (const item of items) {
			DataManager.$gameParty.gainItem(item, 1);
		}
	}
}
