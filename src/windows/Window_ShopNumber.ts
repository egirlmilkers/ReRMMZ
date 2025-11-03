// Window_ShopNumber
//
// The window for inputting quantity of items to buy or sell on the shop
// screen.

import { Input, Rectangle } from "../core/index.js";
import { ConfigManager, TextManager } from "../managers/index.js";
import { Sprite_Button } from "../sprites/index.js";
import { Window_Selectable } from "../windows/index.js";

export class Window_ShopNumber extends Window_Selectable {
	constructor(rect) {
		super(rect);
		this._item = null;
		this._max = 1;
		this._price = 0;
		this._number = 1;
		this._currencyUnit = TextManager.currencyUnit;
		this.createButtons();
		this.select(0);
		this._canRepeat = false;
	}

	isScrollEnabled() {
		return false;
	}

	number() {
		return this._number;
	}

	setup(item, max, price) {
		this._item = item;
		this._max = Math.floor(max);
		this._price = price;
		this._number = 1;
		this.placeButtons();
		this.refresh();
	}

	setCurrencyUnit(currencyUnit) {
		this._currencyUnit = currencyUnit;
		this.refresh();
	}

	createButtons() {
		this._buttons = [];
		if (ConfigManager.touchUI) {
			for (const type of ["down2", "down", "up", "up2", "ok"]) {
				const button = new Sprite_Button(type);
				this._buttons.push(button);
				this.addInnerChild(button);
			}
			this._buttons[0].setClickHandler(this.onButtonDown2.bind(this));
			this._buttons[1].setClickHandler(this.onButtonDown.bind(this));
			this._buttons[2].setClickHandler(this.onButtonUp.bind(this));
			this._buttons[3].setClickHandler(this.onButtonUp2.bind(this));
			this._buttons[4].setClickHandler(this.onButtonOk.bind(this));
		}
	}

	placeButtons() {
		const sp = this.buttonSpacing();
		const totalWidth = this.totalButtonWidth();
		let x = (this.innerWidth - totalWidth) / 2;
		for (const button of this._buttons) {
			button.x = x;
			button.y = this.buttonY();
			x += button.width + sp;
		}
	}

	totalButtonWidth() {
		const sp = this.buttonSpacing();
		return this._buttons.reduce((r, button) => r + button.width + sp, -sp);
	}

	buttonSpacing() {
		return 8;
	}

	refresh() {
		super.refresh();
		this.drawItemBackground(0);
		this.drawCurrentItemName();
		this.drawMultiplicationSign();
		this.drawNumber();
		this.drawHorzLine();
		this.drawTotalPrice();
	}

	drawCurrentItemName() {
		const padding = this.itemPadding();
		const x = padding * 2;
		const y = this.itemNameY();
		const width = this.multiplicationSignX() - padding * 3;
		this.drawItemName(this._item, x, y, width);
	}

	drawMultiplicationSign() {
		const sign = this.multiplicationSign();
		const width = this.textWidth(sign);
		const x = this.multiplicationSignX();
		const y = this.itemNameY();
		this.resetTextColor();
		this.drawText(sign, x, y, width);
	}

	multiplicationSign() {
		return "\u00d7";
	}

	multiplicationSignX() {
		const sign = this.multiplicationSign();
		const width = this.textWidth(sign);
		return this.cursorX() - width * 2;
	}

	drawNumber() {
		const x = this.cursorX();
		const y = this.itemNameY();
		const width = this.cursorWidth() - this.itemPadding();
		this.resetTextColor();
		this.drawText(this._number, x, y, width, "right");
	}

	drawHorzLine() {
		const padding = this.itemPadding();
		const lineHeight = this.lineHeight();
		const itemY = this.itemNameY();
		const totalY = this.totalPriceY();
		const x = padding;
		const y = Math.floor((itemY + totalY + lineHeight) / 2);
		const width = this.innerWidth - padding * 2;
		this.drawRect(x, y, width, 5);
	}

	drawTotalPrice() {
		const padding = this.itemPadding();
		const total = this._price * this._number;
		const width = this.innerWidth - padding * 2;
		const y = this.totalPriceY();
		this.drawCurrencyValue(total, this._currencyUnit, 0, y, width);
	}

	itemNameY() {
		return Math.floor(this.innerHeight / 2 - this.lineHeight() * 1.5);
	}

	totalPriceY() {
		return Math.floor(this.itemNameY() + this.lineHeight() * 2);
	}

	buttonY() {
		return Math.floor(this.totalPriceY() + this.lineHeight() * 2);
	}

	cursorWidth() {
		const padding = this.itemPadding();
		const digitWidth = this.textWidth("0");
		return this.maxDigits() * digitWidth + padding * 2;
	}

	cursorX() {
		const padding = this.itemPadding();
		return this.innerWidth - this.cursorWidth() - padding * 2;
	}

	maxDigits() {
		return 2;
	}

	update() {
		super.update();
		this.processNumberChange();
	}

	playOkSound() {
		//
	}

	processNumberChange() {
		if (this.isOpenAndActive()) {
			if (Input.isRepeated("right")) {
				this.changeNumber(1);
			}
			if (Input.isRepeated("left")) {
				this.changeNumber(-1);
			}
			if (Input.isRepeated("up")) {
				this.changeNumber(10);
			}
			if (Input.isRepeated("down")) {
				this.changeNumber(-10);
			}
		}
	}

	changeNumber(amount) {
		const lastNumber = this._number;
		this._number = (this._number + amount).clamp(1, this._max);
		if (this._number !== lastNumber) {
			this.playCursorSound();
			this.refresh();
		}
	}

	itemRect() {
		const rect = new Rectangle();
		rect.x = this.cursorX();
		rect.y = this.itemNameY();
		rect.width = this.cursorWidth();
		rect.height = this.lineHeight();
		return rect;
	}

	isTouchOkEnabled() {
		return false;
	}

	onButtonUp() {
		this.changeNumber(1);
	}

	onButtonUp2() {
		this.changeNumber(10);
	}

	onButtonDown() {
		this.changeNumber(-1);
	}

	onButtonDown2() {
		this.changeNumber(-10);
	}

	onButtonOk() {
		this.processOk();
	}
}
