// SoundManager
//
// The static class that plays sound effects defined in the database.

import { AudioManager, DataManager } from "../managers/index.js";

export class SoundManager {
	constructor() {
		throw new Error("This is a static class");
	}

	static preloadImportantSounds() {
		SoundManager.loadSystemSound(0);
		SoundManager.loadSystemSound(1);
		SoundManager.loadSystemSound(2);
		SoundManager.loadSystemSound(3);
	}

	static loadSystemSound(n) {
		if (DataManager.$dataSystem) {
			AudioManager.loadStaticSe(DataManager.$dataSystem.sounds[n]);
		}
	}

	static playSystemSound(n) {
		if (DataManager.$dataSystem) {
			AudioManager.playStaticSe(DataManager.$dataSystem.sounds[n]);
		}
	}

	static playCursor() {
		SoundManager.playSystemSound(0);
	}

	static playOk() {
		SoundManager.playSystemSound(1);
	}

	static playCancel() {
		SoundManager.playSystemSound(2);
	}

	static playBuzzer() {
		SoundManager.playSystemSound(3);
	}

	static playEquip() {
		SoundManager.playSystemSound(4);
	}

	static playSave() {
		SoundManager.playSystemSound(5);
	}

	static playLoad() {
		SoundManager.playSystemSound(6);
	}

	static playBattleStart() {
		SoundManager.playSystemSound(7);
	}

	static playEscape() {
		SoundManager.playSystemSound(8);
	}

	static playEnemyAttack() {
		SoundManager.playSystemSound(9);
	}

	static playEnemyDamage() {
		SoundManager.playSystemSound(10);
	}

	static playEnemyCollapse() {
		SoundManager.playSystemSound(11);
	}

	static playBossCollapse1() {
		SoundManager.playSystemSound(12);
	}

	static playBossCollapse2() {
		SoundManager.playSystemSound(13);
	}

	static playActorDamage() {
		SoundManager.playSystemSound(14);
	}

	static playActorCollapse() {
		SoundManager.playSystemSound(15);
	}

	static playRecovery() {
		SoundManager.playSystemSound(16);
	}

	static playMiss() {
		SoundManager.playSystemSound(17);
	}

	static playEvasion() {
		SoundManager.playSystemSound(18);
	}

	static playMagicEvasion() {
		SoundManager.playSystemSound(19);
	}

	static playReflection() {
		SoundManager.playSystemSound(20);
	}

	static playShop() {
		SoundManager.playSystemSound(21);
	}

	static playUseItem() {
		SoundManager.playSystemSound(22);
	}

	static playUseSkill() {
		SoundManager.playSystemSound(23);
	}
}
