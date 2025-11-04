// Window_NumberInput
//
// The window used for the event command [Input Number].

import { Graphics } from 'src/core/Graphics.js';
import { Input } from 'src/core/Input.js';
import { Rectangle } from 'src/core/Rectangle.js';

import { ConfigManager } from 'src/managers/ConfigManager.js';
import { DataManager } from 'src/managers/DataManager.js';

import { Sprite_Button } from 'src/sprites/Sprite_Button.js';

import { Window_Selectable } from './Window_Selectable.js';

export class Window_NumberInput extends Window_Selectable {
    constructor() {
        super(new Rectangle());
        this._number = 0;
        this._maxDigits = 1;
        this.openness = 0;
        this.createButtons();
        this.deactivate();
        this._canRepeat = false;
    }

    setMessageWindow(messageWindow) {
        this._messageWindow = messageWindow;
    }

    start() {
        this._maxDigits = DataManager.$gameMessage.numInputMaxDigits();
        this._number = DataManager.$gameVariables.value(DataManager.$gameMessage.numInputVariableId());
        this._number = this._number.clamp(0, Math.pow(10, this._maxDigits) - 1);
        this.updatePlacement();
        this.placeButtons();
        this.createContents();
        this.refresh();
        this.open();
        this.activate();
        this.select(0);
    }

    updatePlacement() {
        const messageY = this._messageWindow.y;
        const spacing = 8;
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        this.x = (Graphics.boxWidth - this.width) / 2;
        if (messageY >= Graphics.boxHeight / 2) {
            this.y = messageY - this.height - spacing;
        } else {
            this.y = messageY + this._messageWindow.height + spacing;
        }
    }

    windowWidth() {
        const totalItemWidth = this.maxCols() * this.itemWidth();
        const totalButtonWidth = this.totalButtonWidth();
        return Math.max(totalItemWidth, totalButtonWidth) + this.padding * 2;
    }

    windowHeight() {
        if (ConfigManager.touchUI) {
            return this.fittingHeight(1) + this.buttonSpacing() + 48;
        } else {
            return this.fittingHeight(1);
        }
    }

    maxCols() {
        return this._maxDigits;
    }

    maxItems() {
        return this._maxDigits;
    }

    itemWidth() {
        return 48;
    }

    itemRect(index) {
        const rect = Window_Selectable.prototype.itemRect.call(this, index);
        const innerMargin = this.innerWidth - this.maxCols() * this.itemWidth();
        rect.x += innerMargin / 2;
        return rect;
    }

    isScrollEnabled() {
        return false;
    }

    isHoverEnabled() {
        return false;
    }

    createButtons() {
        this._buttons = [];
        if (ConfigManager.touchUI) {
            for (const type of ["down", "up", "ok"]) {
                const button = new Sprite_Button(type);
                this._buttons.push(button);
                this.addInnerChild(button);
            }
            this._buttons[0].setClickHandler(this.onButtonDown.bind(this));
            this._buttons[1].setClickHandler(this.onButtonUp.bind(this));
            this._buttons[2].setClickHandler(this.onButtonOk.bind(this));
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

    buttonY() {
        return this.itemHeight() + this.buttonSpacing();
    }

    update() {
        super.update();
        this.processDigitChange();
    }

    processDigitChange() {
        if (this.isOpenAndActive()) {
            if (Input.isRepeated("up")) {
                this.changeDigit(true);
            } else if (Input.isRepeated("down")) {
                this.changeDigit(false);
            }
        }
    }

    changeDigit(up) {
        const index = this.index();
        const place = Math.pow(10, this._maxDigits - 1 - index);
        let n = Math.floor(this._number / place) % 10;
        this._number -= n * place;
        if (up) {
            n = (n + 1) % 10;
        } else {
            n = (n + 9) % 10;
        }
        this._number += n * place;
        this.refresh();
        this.playCursorSound();
    }

    isTouchOkEnabled() {
        return false;
    }

    isOkEnabled() {
        return true;
    }

    isCancelEnabled() {
        return false;
    }

    processOk() {
        this.playOkSound();
        DataManager.$gameVariables.setValue(DataManager.$gameMessage.numInputVariableId(), this._number);
        this._messageWindow.terminateMessage();
        this.updateInputData();
        this.deactivate();
        this.close();
    }

    drawItem(index) {
        const rect = this.itemLineRect(index);
        const align = "center";
        const s = this._number.padZero(this._maxDigits);
        const c = s.slice(index, index + 1);
        this.resetTextColor();
        this.drawText(c, rect.x, rect.y, rect.width, align);
    }

    onButtonUp() {
        this.changeDigit(true);
    }

    onButtonDown() {
        this.changeDigit(false);
    }

    onButtonOk() {
        this.processOk();
    }
}
