// ColorManager
//
// The static class that handles the window colors.

import { ImageManager } from "../managers/index.js";

export class ColorManager {
	constructor() {
		throw new Error("This is a static class");
	}

	static loadWindowskin() {
		ColorManager._windowskin = ImageManager.loadSystem("Window");
	}

	static textColor(n) {
		const px = 96 + (n % 8) * 12 + 6;
		const py = 144 + Math.floor(n / 8) * 12 + 6;
		return ColorManager._windowskin.getPixel(px, py);
	}

	static normalColor() {
		return ColorManager.textColor(0);
	}

	static systemColor() {
		return ColorManager.textColor(16);
	}

	static crisisColor() {
		return ColorManager.textColor(17);
	}

	static deathColor() {
		return ColorManager.textColor(18);
	}

	static gaugeBackColor() {
		return ColorManager.textColor(19);
	}

	static hpGaugeColor1() {
		return ColorManager.textColor(20);
	}

	static hpGaugeColor2() {
		return ColorManager.textColor(21);
	}

	static mpGaugeColor1() {
		return ColorManager.textColor(22);
	}

	static mpGaugeColor2() {
		return ColorManager.textColor(23);
	}

	static mpCostColor() {
		return ColorManager.textColor(23);
	}

	static powerUpColor() {
		return ColorManager.textColor(24);
	}

	static powerDownColor() {
		return ColorManager.textColor(25);
	}

	static ctGaugeColor1() {
		return ColorManager.textColor(26);
	}

	static ctGaugeColor2() {
		return ColorManager.textColor(27);
	}

	static tpGaugeColor1() {
		return ColorManager.textColor(28);
	}

	static tpGaugeColor2() {
		return ColorManager.textColor(29);
	}

	static tpCostColor() {
		return ColorManager.textColor(29);
	}

	static pendingColor() {
		return ColorManager._windowskin.getPixel(120, 120);
	}

	static hpColor(actor) {
		if (!actor) {
			return ColorManager.normalColor();
		} else if (actor.isDead()) {
			return ColorManager.deathColor();
		} else if (actor.isDying()) {
			return ColorManager.crisisColor();
		} else {
			return ColorManager.normalColor();
		}
	}

	static mpColor() /*actor*/ {
		return ColorManager.normalColor();
	}

	static tpColor() /*actor*/ {
		return ColorManager.normalColor();
	}

	static paramchangeTextColor(change) {
		if (change > 0) {
			return ColorManager.powerUpColor();
		} else if (change < 0) {
			return ColorManager.powerDownColor();
		} else {
			return ColorManager.normalColor();
		}
	}

	static damageColor(colorType) {
		switch (colorType) {
			case 0: // HP damage
				return "#ffffff";
			case 1: // HP recover
				return "#b9ffb5";
			case 2: // MP damage
				return "#ffff90";
			case 3: // MP recover
				return "#80b0ff";
			default:
				return "#808080";
		}
	}

	static outlineColor() {
		return "rgba(0, 0, 0, 0.6)";
	}

	static dimColor1() {
		return "rgba(0, 0, 0, 0.6)";
	}

	static dimColor2() {
		return "rgba(0, 0, 0, 0)";
	}

	static itemBackColor1() {
		return "rgba(32, 32, 32, 0.5)";
	}

	static itemBackColor2() {
		return "rgba(0, 0, 0, 0.5)";
	}
}
