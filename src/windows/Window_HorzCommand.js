// Window_HorzCommand
//
// The command window for the horizontal selection format.

import { Window_Command } from './Window_Command.js';

export class Window_HorzCommand extends Window_Command {
    constructor(rect) {
        super(rect);
    }

    maxCols() {
        return 4;
    }

    itemTextAlign() {
        return "center";
    }
}
