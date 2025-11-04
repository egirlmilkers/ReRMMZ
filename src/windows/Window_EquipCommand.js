// Window_EquipCommand
//
// The window for selecting a command on the equipment screen.

import { TextManager } from 'src/managers/TextManager.js';

import { Window_HorzCommand } from './Window_HorzCommand.js';

export class Window_EquipCommand extends Window_HorzCommand {
    constructor(rect) {
        super(rect);
    }

    maxCols() {
        return 3;
    }

    makeCommandList() {
        this.addCommand(TextManager.equip2, "equip");
        this.addCommand(TextManager.optimize, "optimize");
        this.addCommand(TextManager.clear, "clear");
    }
}
