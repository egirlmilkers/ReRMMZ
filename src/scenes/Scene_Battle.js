// Scene_Battle
//
// The scene class of the battle screen.

import { Graphics } from "../core/Graphics.js";
import { Rectangle } from "../core/Rectangle.js";

import { BattleManager } from "../managers/BattleManager.js";
import { ConfigManager } from "../managers/ConfigManager.js";
import { DataManager } from "../managers/DataManager.js";
import { AudioManager } from "../managers/AudioManager.js";
import { SceneManager } from "../managers/SceneManager.js";

import { Spriteset_Battle } from "../sprites/Spriteset_Battle.js";
import { Sprite_Button } from "../sprites/Sprite_Button.js";

import { Window_BattleActor } from "../windows/Window_BattleActor.js";
import { Window_BattleEnemy } from "../windows/Window_BattleEnemy.js";
import { Window_BattleLog } from "../windows/Window_BattleLog.js";
import { Window_BattleStatus } from "../windows/Window_BattleStatus.js";
import { Window_PartyCommand } from "../windows/Window_PartyCommand.js";
import { Window_ActorCommand } from "../windows/Window_ActorCommand.js";
import { Window_Help } from "../windows/Window_Help.js";
import { Window_BattleSkill } from "../windows/Window_BattleSkill.js";
import { Window_BattleItem } from "../windows/Window_BattleItem.js";

import { Scene_Gameover } from "./Scene_Gameover.js";
import { Scene_Map } from "./Scene_Map.js";
import { Scene_Message } from "./Scene_Message.js";
import { Scene_Title } from "./Scene_Title.js";

export class Scene_Battle extends Scene_Message {
	constructor() {
		super();
	}

	create() {
		super.create();
		this.createDisplayObjects();
	}

	start() {
		super.start();
		BattleManager.playBattleBgm();
		BattleManager.startBattle();
		this._statusWindow.refresh();
		this.startFadeIn(this.fadeSpeed(), false);
	}

	update() {
		const active = this.isActive();
		DataManager.$gameTimer.update(active);
		DataManager.$gameScreen.update();
		this.updateVisibility();
		if (active && !this.isBusy()) {
			this.updateBattleProcess();
		}
		super.update();
	}

	updateVisibility() {
		this.updateLogWindowVisibility();
		this.updateStatusWindowVisibility();
		this.updateInputWindowVisibility();
		this.updateCancelButton();
	}

	updateBattleProcess() {
		BattleManager.update(this.isTimeActive());
	}

	isTimeActive() {
		if (BattleManager.isActiveTpb()) {
			return !this._skillWindow.active && !this._itemWindow.active;
		} else {
			return !this.isAnyInputWindowActive();
		}
	}

	isAnyInputWindowActive() {
		return (
			this._partyCommandWindow.active ||
			this._actorCommandWindow.active ||
			this._skillWindow.active ||
			this._itemWindow.active ||
			this._actorWindow.active ||
			this._enemyWindow.active
		);
	}

	changeInputWindow() {
		this.hideSubInputWindows();
		if (BattleManager.isInputting()) {
			if (BattleManager.actor()) {
				this.startActorCommandSelection();
			} else {
				this.startPartyCommandSelection();
			}
		} else {
			this.endCommandSelection();
		}
	}

	stop() {
		super.stop();
		if (this.needsSlowFadeOut()) {
			this.startFadeOut(this.slowFadeSpeed(), false);
		} else {
			this.startFadeOut(this.fadeSpeed(), false);
		}
		this._statusWindow.close();
		this._partyCommandWindow.close();
		this._actorCommandWindow.close();
	}

	terminate() {
		super.terminate();
		DataManager.$gameParty.onBattleEnd();
		DataManager.$gameTroop.onBattleEnd();
		AudioManager.stopMe();
		if (this.shouldAutosave()) {
			this.requestAutosave();
		}
	}

	shouldAutosave() {
		return SceneManager.isNextScene(Scene_Map);
	}

	needsSlowFadeOut() {
		return (
			SceneManager.isNextScene(Scene_Title) ||
			SceneManager.isNextScene(Scene_Gameover)
		);
	}

	updateLogWindowVisibility() {
		this._logWindow.visible = !this._helpWindow.visible;
	}

	updateStatusWindowVisibility() {
		if (DataManager.$gameMessage.isBusy()) {
			this._statusWindow.close();
		} else if (this.shouldOpenStatusWindow()) {
			this._statusWindow.open();
		}
		this.updateStatusWindowPosition();
	}

	shouldOpenStatusWindow() {
		return (
			this.isActive() &&
			!this.isMessageWindowClosing() &&
			!BattleManager.isBattleEnd()
		);
	}

	updateStatusWindowPosition() {
		const statusWindow = this._statusWindow;
		const targetX = this.statusWindowX();
		if (statusWindow.x < targetX) {
			statusWindow.x = Math.min(statusWindow.x + 16, targetX);
		}
		if (statusWindow.x > targetX) {
			statusWindow.x = Math.max(statusWindow.x - 16, targetX);
		}
	}

	statusWindowX() {
		if (this.isAnyInputWindowActive()) {
			return this.statusWindowRect().x;
		} else {
			return this._partyCommandWindow.width / 2;
		}
	}

	updateInputWindowVisibility() {
		if (DataManager.$gameMessage.isBusy()) {
			this.closeCommandWindows();
			this.hideSubInputWindows();
		} else if (this.needsInputWindowChange()) {
			this.changeInputWindow();
		}
	}

	needsInputWindowChange() {
		const windowActive = this.isAnyInputWindowActive();
		const inputting = BattleManager.isInputting();
		if (windowActive && inputting) {
			return this._actorCommandWindow.actor() !== BattleManager.actor();
		}
		return windowActive !== inputting;
	}

	updateCancelButton() {
		if (this._cancelButton) {
			this._cancelButton.visible =
				this.isAnyInputWindowActive() &&
				!this._partyCommandWindow.active;
		}
	}

	createDisplayObjects() {
		this.createSpriteset();
		this.createWindowLayer();
		this.createAllWindows();
		this.createButtons();
		BattleManager.setLogWindow(this._logWindow);
		BattleManager.setSpriteset(this._spriteset);
		this._logWindow.setSpriteset(this._spriteset);
	}

	createSpriteset() {
		this._spriteset = new Spriteset_Battle();
		this.addChild(this._spriteset);
	}

	createAllWindows() {
		this.createLogWindow();
		this.createStatusWindow();
		this.createPartyCommandWindow();
		this.createActorCommandWindow();
		this.createHelpWindow();
		this.createSkillWindow();
		this.createItemWindow();
		this.createActorWindow();
		this.createEnemyWindow();
		super.createAllWindows();
	}

	createLogWindow() {
		const rect = this.logWindowRect();
		this._logWindow = new Window_BattleLog(rect);
		this.addWindow(this._logWindow);
	}

	logWindowRect() {
		const wx = 0;
		const wy = 0;
		const ww = Graphics.boxWidth;
		const wh = this.calcWindowHeight(10, false);
		return new Rectangle(wx, wy, ww, wh);
	}

	createStatusWindow() {
		const rect = this.statusWindowRect();
		const statusWindow = new Window_BattleStatus(rect);
		this.addWindow(statusWindow);
		this._statusWindow = statusWindow;
	}

	statusWindowRect() {
		const extra = 10;
		const ww = Graphics.boxWidth - 192;
		const wh = this.windowAreaHeight() + extra;
		const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh + extra - 4;
		return new Rectangle(wx, wy, ww, wh);
	}

	createPartyCommandWindow() {
		const rect = this.partyCommandWindowRect();
		const commandWindow = new Window_PartyCommand(rect);
		commandWindow.setHandler("fight", this.commandFight.bind(this));
		commandWindow.setHandler("escape", this.commandEscape.bind(this));
		commandWindow.deselect();
		this.addWindow(commandWindow);
		this._partyCommandWindow = commandWindow;
	}

	partyCommandWindowRect() {
		const ww = 192;
		const wh = this.windowAreaHeight();
		const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	}

	createActorCommandWindow() {
		const rect = this.actorCommandWindowRect();
		const commandWindow = new Window_ActorCommand(rect);
		commandWindow.y = Graphics.boxHeight - commandWindow.height;
		commandWindow.setHandler("attack", this.commandAttack.bind(this));
		commandWindow.setHandler("skill", this.commandSkill.bind(this));
		commandWindow.setHandler("guard", this.commandGuard.bind(this));
		commandWindow.setHandler("item", this.commandItem.bind(this));
		commandWindow.setHandler("cancel", this.commandCancel.bind(this));
		this.addWindow(commandWindow);
		this._actorCommandWindow = commandWindow;
	}

	actorCommandWindowRect() {
		const ww = 192;
		const wh = this.windowAreaHeight();
		const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	}

	createHelpWindow() {
		const rect = this.helpWindowRect();
		this._helpWindow = new Window_Help(rect);
		this._helpWindow.hide();
		this.addWindow(this._helpWindow);
	}

	helpWindowRect() {
		const wx = 0;
		const wy = this.helpAreaTop();
		const ww = Graphics.boxWidth;
		const wh = this.helpAreaHeight();
		return new Rectangle(wx, wy, ww, wh);
	}

	createSkillWindow() {
		const rect = this.skillWindowRect();
		this._skillWindow = new Window_BattleSkill(rect);
		this._skillWindow.setHelpWindow(this._helpWindow);
		this._skillWindow.setHandler("ok", this.onSkillOk.bind(this));
		this._skillWindow.setHandler("cancel", this.onSkillCancel.bind(this));
		this.addWindow(this._skillWindow);
	}

	skillWindowRect() {
		const ww = Graphics.boxWidth;
		const wh = this.windowAreaHeight();
		const wx = 0;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	}

	createItemWindow() {
		const rect = this.itemWindowRect();
		this._itemWindow = new Window_BattleItem(rect);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
		this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
		this.addWindow(this._itemWindow);
	}

	itemWindowRect() {
		return this.skillWindowRect();
	}

	createActorWindow() {
		const rect = this.actorWindowRect();
		this._actorWindow = new Window_BattleActor(rect);
		this._actorWindow.setHandler("ok", this.onActorOk.bind(this));
		this._actorWindow.setHandler("cancel", this.onActorCancel.bind(this));
		this.addWindow(this._actorWindow);
	}

	actorWindowRect() {
		return this.statusWindowRect();
	}

	createEnemyWindow() {
		const rect = this.enemyWindowRect();
		this._enemyWindow = new Window_BattleEnemy(rect);
		this._enemyWindow.setHandler("ok", this.onEnemyOk.bind(this));
		this._enemyWindow.setHandler("cancel", this.onEnemyCancel.bind(this));
		this.addWindow(this._enemyWindow);
	}

	enemyWindowRect() {
		const wx = this._statusWindow.x;
		const ww = this._statusWindow.width;
		const wh = this.windowAreaHeight();
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	}

	helpAreaTop() {
		return 0;
	}

	helpAreaBottom() {
		return this.helpAreaTop() + this.helpAreaHeight();
	}

	helpAreaHeight() {
		return this.calcWindowHeight(2, false);
	}

	buttonAreaTop() {
		return this.helpAreaBottom();
	}

	windowAreaHeight() {
		return this.calcWindowHeight(4, true);
	}

	createButtons() {
		if (ConfigManager.touchUI) {
			this.createCancelButton();
		}
	}

	createCancelButton() {
		this._cancelButton = new Sprite_Button("cancel");
		this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
		this._cancelButton.y = this.buttonY();
		this.addWindow(this._cancelButton);
	}

	closeCommandWindows() {
		this._partyCommandWindow.deactivate();
		this._actorCommandWindow.deactivate();
		this._partyCommandWindow.close();
		this._actorCommandWindow.close();
	}

	hideSubInputWindows() {
		this._actorWindow.deactivate();
		this._enemyWindow.deactivate();
		this._skillWindow.deactivate();
		this._itemWindow.deactivate();
		this._actorWindow.hide();
		this._enemyWindow.hide();
		this._skillWindow.hide();
		this._itemWindow.hide();
	}

	startPartyCommandSelection() {
		this._statusWindow.deselect();
		this._statusWindow.show();
		this._statusWindow.open();
		this._actorCommandWindow.setup(null);
		this._actorCommandWindow.close();
		this._partyCommandWindow.setup();
	}

	commandFight() {
		this.selectNextCommand();
	}

	commandEscape() {
		BattleManager.processEscape();
		this.changeInputWindow();
	}

	startActorCommandSelection() {
		this._statusWindow.show();
		this._statusWindow.selectActor(BattleManager.actor());
		this._partyCommandWindow.close();
		this._actorCommandWindow.show();
		this._actorCommandWindow.setup(BattleManager.actor());
	}

	commandAttack() {
		const action = BattleManager.inputtingAction();
		action.setAttack();
		this.onSelectAction();
	}

	commandSkill() {
		this._skillWindow.setActor(BattleManager.actor());
		this._skillWindow.setStypeId(this._actorCommandWindow.currentExt());
		this._skillWindow.refresh();
		this._skillWindow.show();
		this._skillWindow.activate();
		this._statusWindow.hide();
		this._actorCommandWindow.hide();
	}

	commandGuard() {
		const action = BattleManager.inputtingAction();
		action.setGuard();
		this.onSelectAction();
	}

	commandItem() {
		this._itemWindow.refresh();
		this._itemWindow.show();
		this._itemWindow.activate();
		this._statusWindow.hide();
		this._actorCommandWindow.hide();
	}

	commandCancel() {
		this.selectPreviousCommand();
	}

	selectNextCommand() {
		BattleManager.selectNextCommand();
		this.changeInputWindow();
	}

	selectPreviousCommand() {
		BattleManager.selectPreviousCommand();
		this.changeInputWindow();
	}

	startActorSelection() {
		this._actorWindow.refresh();
		this._actorWindow.show();
		this._actorWindow.activate();
	}

	onActorOk() {
		const action = BattleManager.inputtingAction();
		action.setTarget(this._actorWindow.index());
		this.hideSubInputWindows();
		this.selectNextCommand();
	}

	onActorCancel() {
		this._actorWindow.hide();
		switch (this._actorCommandWindow.currentSymbol()) {
			case "skill":
				this._skillWindow.show();
				this._skillWindow.activate();
				break;
			case "item":
				this._itemWindow.show();
				this._itemWindow.activate();
				break;
		}
	}

	startEnemySelection() {
		this._enemyWindow.refresh();
		this._enemyWindow.show();
		this._enemyWindow.select(0);
		this._enemyWindow.activate();
		this._statusWindow.hide();
	}

	onEnemyOk() {
		const action = BattleManager.inputtingAction();
		action.setTarget(this._enemyWindow.enemyIndex());
		this.hideSubInputWindows();
		this.selectNextCommand();
	}

	onEnemyCancel() {
		this._enemyWindow.hide();
		switch (this._actorCommandWindow.currentSymbol()) {
			case "attack":
				this._statusWindow.show();
				this._actorCommandWindow.activate();
				break;
			case "skill":
				this._skillWindow.show();
				this._skillWindow.activate();
				break;
			case "item":
				this._itemWindow.show();
				this._itemWindow.activate();
				break;
		}
	}

	onSkillOk() {
		const skill = this._skillWindow.item();
		const action = BattleManager.inputtingAction();
		action.setSkill(skill.id);
		BattleManager.actor().setLastBattleSkill(skill);
		this.onSelectAction();
	}

	onSkillCancel() {
		this._skillWindow.hide();
		this._statusWindow.show();
		this._actorCommandWindow.show();
		this._actorCommandWindow.activate();
	}

	onItemOk() {
		const item = this._itemWindow.item();
		const action = BattleManager.inputtingAction();
		action.setItem(item.id);
		DataManager.$gameParty.setLastItem(item);
		this.onSelectAction();
	}

	onItemCancel() {
		this._itemWindow.hide();
		this._statusWindow.show();
		this._actorCommandWindow.show();
		this._actorCommandWindow.activate();
	}

	onSelectAction() {
		const action = BattleManager.inputtingAction();
		if (!action.needsSelection()) {
			this.selectNextCommand();
		} else if (action.isForOpponent()) {
			this.startEnemySelection();
		} else {
			this.startActorSelection();
		}
	}

	endCommandSelection() {
		this.closeCommandWindows();
		this.hideSubInputWindows();
		this._statusWindow.deselect();
		this._statusWindow.show();
	}
}
