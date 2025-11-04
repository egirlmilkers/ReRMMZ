// Window_Gold
//
// The window for displaying the party's gold.

import { DataManager } from 'src/managers/DataManager.js';
import { TextManager } from 'src/managers/TextManager.js';

import { Window_Selectable } from './Window_Selectable.js';

export class Window_Gold extends Window_Selectable {
    constructor(rect) {
        super(rect);
        this.refresh();
    }

    colSpacing() {
        return 0;
    }

    refresh() {
        const rect = this.itemLineRect(0);
        const x = rect.x;
        const y = rect.y;
        const width = rect.width;
        this.contents.clear();
        this.drawCurrencyValue(this.value(), this.currencyUnit(), x, y, width);
    }

    value() {
        return DataManager.$gameParty.gold();
    }

    currencyUnit() {
        return TextManager.currencyUnit;
    }

    open() {
        this.refresh();
        super.open();
    }
}
