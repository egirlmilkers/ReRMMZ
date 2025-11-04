// Sprite_Gauge
//
// The sprite for displaying a status gauge.

import { Bitmap } from "../core/Bitmap";
import { Sprite } from "../core/Sprite";

import { ColorManager } from "../managers/ColorManager";
import { DataManager } from "../managers/DataManager";
import { TextManager } from "../managers/TextManager";

export class Sprite_Gauge extends Sprite {
	constructor() {
		super();
		this.initMembers();
		this.createBitmap();
	}

	initMembers() {
		this._battler = null;
		this._statusType = "";
		this._value = NaN;
		this._maxValue = NaN;
		this._targetValue = NaN;
		this._targetMaxValue = NaN;
		this._duration = 0;
		this._flashingCount = 0;
	}

	destroy(options) {
		this.bitmap.destroy();
		super.destroy(options);
	}

	createBitmap() {
		const width = this.bitmapWidth();
		const height = this.bitmapHeight();
		this.bitmap = new Bitmap(width, height);
	}

	bitmapWidth() {
		return 128;
	}

	bitmapHeight() {
		return 32;
	}

	textHeight() {
		return 24;
	}

	gaugeHeight() {
		return 12;
	}

	gaugeX() {
		if (this._statusType === "time") {
			return 0;
		} else {
			return this.measureLabelWidth() + 6;
		}
	}

	labelY() {
		return 3;
	}

	labelFontFace() {
		return DataManager.$gameSystem.mainFontFace();
	}

	labelFontSize() {
		return DataManager.$gameSystem.mainFontSize() - 2;
	}

	valueFontFace() {
		return DataManager.$gameSystem.numberFontFace();
	}

	valueFontSize() {
		return DataManager.$gameSystem.mainFontSize() - 6;
	}

	setup(battler, statusType) {
		this._battler = battler;
		this._statusType = statusType;
		this._value = this.currentValue();
		this._maxValue = this.currentMaxValue();
		this.updateBitmap();
	}

	update() {
		super.update();
		this.updateBitmap();
	}

	updateBitmap() {
		const value = this.currentValue();
		const maxValue = this.currentMaxValue();
		if (value !== this._targetValue || maxValue !== this._targetMaxValue) {
			this.updateTargetValue(value, maxValue);
		}
		this.updateGaugeAnimation();
		this.updateFlashing();
	}

	updateTargetValue(value, maxValue) {
		this._targetValue = value;
		this._targetMaxValue = maxValue;
		if (isNaN(this._value)) {
			this._value = value;
			this._maxValue = maxValue;
			this.redraw();
		} else {
			this._duration = this.smoothness();
		}
	}

	smoothness() {
		return this._statusType === "time" ? 5 : 20;
	}

	updateGaugeAnimation() {
		if (this._duration > 0) {
			const d = this._duration;
			this._value = (this._value * (d - 1) + this._targetValue) / d;
			this._maxValue =
				(this._maxValue * (d - 1) + this._targetMaxValue) / d;
			this._duration--;
			this.redraw();
		}
	}

	updateFlashing() {
		if (this._statusType === "time") {
			this._flashingCount++;
			if (this._battler.isInputting()) {
				if (this._flashingCount % 30 < 15) {
					this.setBlendColor(this.flashingColor1());
				} else {
					this.setBlendColor(this.flashingColor2());
				}
			} else {
				this.setBlendColor([0, 0, 0, 0]);
			}
		}
	}

	flashingColor1() {
		return [255, 255, 255, 64];
	}

	flashingColor2() {
		return [0, 0, 255, 48];
	}

	isValid() {
		if (this._battler) {
			if (this._statusType === "tp" && !this._battler.isPreserveTp()) {
				return DataManager.$gameParty.inBattle();
			} else {
				return true;
			}
		}
		return false;
	}

	currentValue() {
		if (this._battler) {
			switch (this._statusType) {
				case "hp":
					return this._battler.hp;
				case "mp":
					return this._battler.mp;
				case "tp":
					return this._battler.tp;
				case "time":
					return this._battler.tpbChargeTime();
			}
		}
		return NaN;
	}

	currentMaxValue() {
		if (this._battler) {
			switch (this._statusType) {
				case "hp":
					return this._battler.mhp;
				case "mp":
					return this._battler.mmp;
				case "tp":
					return this._battler.maxTp();
				case "time":
					return 1;
			}
		}
		return NaN;
	}

	label() {
		switch (this._statusType) {
			case "hp":
				return TextManager.hpA;
			case "mp":
				return TextManager.mpA;
			case "tp":
				return TextManager.tpA;
			default:
				return "";
		}
	}

	gaugeBackColor() {
		return ColorManager.gaugeBackColor();
	}

	gaugeColor1() {
		switch (this._statusType) {
			case "hp":
				return ColorManager.hpGaugeColor1();
			case "mp":
				return ColorManager.mpGaugeColor1();
			case "tp":
				return ColorManager.tpGaugeColor1();
			case "time":
				return ColorManager.ctGaugeColor1();
			default:
				return ColorManager.normalColor();
		}
	}

	gaugeColor2() {
		switch (this._statusType) {
			case "hp":
				return ColorManager.hpGaugeColor2();
			case "mp":
				return ColorManager.mpGaugeColor2();
			case "tp":
				return ColorManager.tpGaugeColor2();
			case "time":
				return ColorManager.ctGaugeColor2();
			default:
				return ColorManager.normalColor();
		}
	}

	labelColor() {
		return ColorManager.systemColor();
	}

	labelOutlineColor() {
		return ColorManager.outlineColor();
	}

	labelOutlineWidth() {
		return 3;
	}

	valueColor() {
		switch (this._statusType) {
			case "hp":
				return ColorManager.hpColor(this._battler);
			case "mp":
				return ColorManager.mpColor(this._battler);
			case "tp":
				return ColorManager.tpColor(this._battler);
			default:
				return ColorManager.normalColor();
		}
	}

	valueOutlineColor() {
		return "rgba(0, 0, 0, 1)";
	}

	valueOutlineWidth() {
		return 2;
	}

	redraw() {
		this.bitmap.clear();
		const currentValue = this.currentValue();
		if (!isNaN(currentValue)) {
			this.drawGauge();
			if (this._statusType !== "time") {
				this.drawLabel();
				if (this.isValid()) {
					this.drawValue();
				}
			}
		}
	}

	drawGauge() {
		const gaugeX = this.gaugeX();
		const gaugeY = this.textHeight() - this.gaugeHeight();
		const gaugewidth = this.bitmapWidth() - gaugeX;
		const gaugeHeight = this.gaugeHeight();
		this.drawGaugeRect(gaugeX, gaugeY, gaugewidth, gaugeHeight);
	}

	drawGaugeRect(x, y, width, height) {
		const rate = this.gaugeRate();
		const fillW = Math.floor((width - 2) * rate);
		const fillH = height - 2;
		const color0 = this.gaugeBackColor();
		const color1 = this.gaugeColor1();
		const color2 = this.gaugeColor2();
		this.bitmap.fillRect(x, y, width, height, color0);
		this.bitmap.gradientFillRect(
			x + 1,
			y + 1,
			fillW,
			fillH,
			color1,
			color2,
		);
	}

	gaugeRate() {
		if (this.isValid()) {
			const value = this._value;
			const maxValue = this._maxValue;
			return maxValue > 0 ? value / maxValue : 0;
		} else {
			return 0;
		}
	}

	drawLabel() {
		const label = this.label();
		const x = this.labelOutlineWidth() / 2;
		const y = this.labelY();
		const width = this.bitmapWidth();
		const height = this.textHeight();
		this.setupLabelFont();
		this.bitmap.paintOpacity = this.labelOpacity();
		this.bitmap.drawText(label, x, y, width, height, "left");
		this.bitmap.paintOpacity = 255;
	}

	setupLabelFont() {
		this.bitmap.fontFace = this.labelFontFace();
		this.bitmap.fontSize = this.labelFontSize();
		this.bitmap.textColor = this.labelColor();
		this.bitmap.outlineColor = this.labelOutlineColor();
		this.bitmap.outlineWidth = this.labelOutlineWidth();
	}

	measureLabelWidth() {
		this.setupLabelFont();
		const labels = [TextManager.hpA, TextManager.mpA, TextManager.tpA];
		const widths = labels.map((str) => this.bitmap.measureTextWidth(str));
		return Math.ceil(Math.max(...widths));
	}

	labelOpacity() {
		return this.isValid() ? 255 : 160;
	}

	drawValue() {
		const currentValue = this.currentValue();
		const width = this.bitmapWidth();
		const height = this.textHeight();
		this.setupValueFont();
		this.bitmap.drawText(currentValue, 0, 0, width, height, "right");
	}

	setupValueFont() {
		this.bitmap.fontFace = this.valueFontFace();
		this.bitmap.fontSize = this.valueFontSize();
		this.bitmap.textColor = this.valueColor();
		this.bitmap.outlineColor = this.valueOutlineColor();
		this.bitmap.outlineWidth = this.valueOutlineWidth();
	}
}
