// Window_MapName
//
// The window for displaying the map name on the map screen.

import { ColorManager } from 'src/managers/ColorManager.js';
import { DataManager } from 'src/managers/DataManager.js';

import { Window_Base } from './Window_Base.js';

export class Window_MapName extends Window_Base {
    constructor(rect) {
        super(rect);
        this.opacity = 0;
        this.contentsOpacity = 0;
        this._showCount = 0;
        this.refresh();
    }

    update() {
        super.update();
        if (this._showCount > 0 && DataManager.$gameMap.isNameDisplayEnabled()) {
            this.updateFadeIn();
            this._showCount--;
        } else {
            this.updateFadeOut();
        }
    }

    updateFadeIn() {
        this.contentsOpacity += 16;
    }

    updateFadeOut() {
        this.contentsOpacity -= 16;
    }

    open() {
        this.refresh();
        this._showCount = 150;
    }

    close() {
        this._showCount = 0;
    }

    refresh() {
        this.contents.clear();
        if (DataManager.$gameMap.displayName()) {
            const width = this.innerWidth;
            this.drawBackground(0, 0, width, this.lineHeight());
            this.drawText(DataManager.$gameMap.displayName(), 0, 0, width, "center");
        }
    }

    drawBackground(x, y, width, height) {
        const color1 = ColorManager.dimColor1();
        const color2 = ColorManager.dimColor2();
        const half = width / 2;
        this.contents.gradientFillRect(x, y, half, height, color2, color1);
        this.contents.gradientFillRect(x + half, y, half, height, color1, color2);
    }
}
