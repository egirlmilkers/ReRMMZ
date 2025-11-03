// TextManager
//
// The static class that handles terms and messages.

import { DataManager } from "../managers/index.js";

export class TextManager {
	constructor() {
		throw new Error("This is a static class");
	}

	static basic(basicId) {
		return DataManager.$dataSystem.terms.basic[basicId] || "";
	}

	static param(paramId) {
		return DataManager.$dataSystem.terms.params[paramId] || "";
	}

	static command(commandId) {
		return DataManager.$dataSystem.terms.commands[commandId] || "";
	}

	static message(messageId) {
		return DataManager.$dataSystem.terms.messages[messageId] || "";
	}

	static get currencyUnit() {
		return DataManager.$dataSystem.currencyUnit;
	}

	// Basic
	static get level() {
		return TextManager.basic(0);
	}
	static get levelA() {
		return TextManager.basic(1);
	}
	static get hp() {
		return TextManager.basic(2);
	}
	static get hpA() {
		return TextManager.basic(3);
	}
	static get mp() {
		return TextManager.basic(4);
	}
	static get mpA() {
		return TextManager.basic(5);
	}
	static get tp() {
		return TextManager.basic(6);
	}
	static get tpA() {
		return TextManager.basic(7);
	}
	static get exp() {
		return TextManager.basic(8);
	}
	static get expA() {
		return TextManager.basic(9);
	}

	// Commands
	static get fight() {
		return TextManager.command(0);
	}
	static get escape() {
		return TextManager.command(1);
	}
	static get attack() {
		return TextManager.command(2);
	}
	static get guard() {
		return TextManager.command(3);
	}
	static get item() {
		return TextManager.command(4);
	}
	static get skill() {
		return TextManager.command(5);
	}
	static get equip() {
		return TextManager.command(6);
	}
	static get status() {
		return TextManager.command(7);
	}
	static get formation() {
		return TextManager.command(8);
	}
	static get save() {
		return TextManager.command(9);
	}
	static get gameEnd() {
		return TextManager.command(10);
	}
	static get options() {
		return TextManager.command(11);
	}
	static get weapon() {
		return TextManager.command(12);
	}
	static get armor() {
		return TextManager.command(13);
	}
	static get keyItem() {
		return TextManager.command(14);
	}
	static get equip2() {
		return TextManager.command(15);
	}
	static get optimize() {
		return TextManager.command(16);
	}
	static get clear() {
		return TextManager.command(17);
	}
	static get newGame() {
		return TextManager.command(18);
	}
	static get continue_() {
		return TextManager.command(19);
	}
	static get toTitle() {
		return TextManager.command(21);
	}
	static get cancel() {
		return TextManager.command(22);
	}
	static get buy() {
		return TextManager.command(24);
	}
	static get sell() {
		return TextManager.command(25);
	}

	// Messages
	static get alwaysDash() {
		return TextManager.message("alwaysDash");
	}
	static get commandRemember() {
		return TextManager.message("commandRemember");
	}
	static get touchUI() {
		return TextManager.message("touchUI");
	}
	static get bgmVolume() {
		return TextManager.message("bgmVolume");
	}
	static get bgsVolume() {
		return TextManager.message("bgsVolume");
	}
	static get meVolume() {
		return TextManager.message("meVolume");
	}
	static get seVolume() {
		return TextManager.message("seVolume");
	}
	static get possession() {
		return TextManager.message("possession");
	}
	static get expTotal() {
		return TextManager.message("expTotal");
	}
	static get expNext() {
		return TextManager.message("expNext");
	}
	static get saveMessage() {
		return TextManager.message("saveMessage");
	}
	static get loadMessage() {
		return TextManager.message("loadMessage");
	}
	static get file() {
		return TextManager.message("file");
	}
	static get autosave() {
		return TextManager.message("autosave");
	}
	static get partyName() {
		return TextManager.message("partyName");
	}
	static get emerge() {
		return TextManager.message("emerge");
	}
	static get preemptive() {
		return TextManager.message("preemptive");
	}
	static get surprise() {
		return TextManager.message("surprise");
	}
	static get escapeStart() {
		return TextManager.message("escapeStart");
	}
	static get escapeFailure() {
		return TextManager.message("escapeFailure");
	}
	static get victory() {
		return TextManager.message("victory");
	}
	static get defeat() {
		return TextManager.message("defeat");
	}
	static get obtainExp() {
		return TextManager.message("obtainExp");
	}
	static get obtainGold() {
		return TextManager.message("obtainGold");
	}
	static get obtainItem() {
		return TextManager.message("obtainItem");
	}
	static get levelUp() {
		return TextManager.message("levelUp");
	}
	static get obtainSkill() {
		return TextManager.message("obtainSkill");
	}
	static get useItem() {
		return TextManager.message("useItem");
	}
	static get criticalToEnemy() {
		return TextManager.message("criticalToEnemy");
	}
	static get criticalToActor() {
		return TextManager.message("criticalToActor");
	}
	static get actorDamage() {
		return TextManager.message("actorDamage");
	}
	static get actorRecovery() {
		return TextManager.message("actorRecovery");
	}
	static get actorGain() {
		return TextManager.message("actorGain");
	}
	static get actorLoss() {
		return TextManager.message("actorLoss");
	}
	static get actorDrain() {
		return TextManager.message("actorDrain");
	}
	static get actorNoDamage() {
		return TextManager.message("actorNoDamage");
	}
	static get actorNoHit() {
		return TextManager.message("actorNoHit");
	}
	static get enemyDamage() {
		return TextManager.message("enemyDamage");
	}
	static get enemyRecovery() {
		return TextManager.message("enemyRecovery");
	}
	static get enemyGain() {
		return TextManager.message("enemyGain");
	}
	static get enemyLoss() {
		return TextManager.message("enemyLoss");
	}
	static get enemyDrain() {
		return TextManager.message("enemyDrain");
	}
	static get enemyNoDamage() {
		return TextManager.message("enemyNoDamage");
	}
	static get enemyNoHit() {
		return TextManager.message("enemyNoHit");
	}
	static get evasion() {
		return TextManager.message("evasion");
	}
	static get magicEvasion() {
		return TextManager.message("magicEvasion");
	}
	static get magicReflection() {
		return TextManager.message("magicReflection");
	}
	static get counterAttack() {
		return TextManager.message("counterAttack");
	}
	static get substitute() {
		return TextManager.message("substitute");
	}
	static get buffAdd() {
		return TextManager.message("buffAdd");
	}
	static get debuffAdd() {
		return TextManager.message("debuffAdd");
	}
	static get buffRemove() {
		return TextManager.message("buffRemove");
	}
	static get actionFailure() {
		return TextManager.message("actionFailure");
	}
}
