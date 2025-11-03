// Window_NameBox
//
// The window for displaying a speaker name above the message window.

import { Graphics, Rectangle } from '../core/index.js';
import { DataManager } from '../managers/index.js';
import { Window_Base } from '../windows/index.js';

export class Window_NameBox extends Window_Base {
    constructor() {
        super(new Rectangle());
        this.openness = 0;
        this._name = "";
    }

    setMessageWindow(messageWindow) {
        this._messageWindow = messageWindow;
    }

    setName(name) {
        if (this._name !== name) {
            this._name = name;
            this.refresh();
        }
    }

    clear() {
        this.setName("");
    }

    start() {
        this.updatePlacement();
        this.updateBackground();
        this.createContents();
        this.refresh();
    }

    updatePlacement() {
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        const messageWindow = this._messageWindow;
        if (DataManager.$gameMessage.isRTL()) {
            this.x = messageWindow.x + messageWindow.width - this.width;
        } else {
            this.x = messageWindow.x;
        }
        if (messageWindow.y > 0) {
            this.y = messageWindow.y - this.height;
        } else {
            this.y = messageWindow.y + messageWindow.height;
        }
    }

    updateBackground() {
        this.setBackgroundType(DataManager.$gameMessage.background());
    }

    windowWidth() {
        if (this._name) {
            const textWidth = this.textSizeEx(this._name).width;
            const padding = this.padding + this.itemPadding();
            const width = Math.ceil(textWidth) + padding * 2;
            return Math.min(width, Graphics.boxWidth);
        } else {
            return 0;
        }
    }

    windowHeight() {
        return this.fittingHeight(1);
    }

    refresh() {
        const rect = this.baseTextRect();
        this.contents.clear();
        this.drawTextEx(this._name, rect.x, rect.y, rect.width);
    }
}
