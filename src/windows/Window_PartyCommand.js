// Window_PartyCommand
//
// The window for selecting whether to fight or escape on the battle screen.

import { BattleManager } from 'src/managers/BattleManager.js';
import { TextManager } from 'src/managers/TextManager.js';

import { Window_Command } from './Window_Command.js';

export class Window_PartyCommand extends Window_Command {
    constructor(rect) {
        super(rect);
        this.openness = 0;
        this.deactivate();
    }

    makeCommandList() {
        this.addCommand(TextManager.fight, "fight");
        this.addCommand(TextManager.escape, "escape", BattleManager.canEscape());
    }

    setup() {
        this.refresh();
        this.forceSelect(0);
        this.activate();
        this.open();
    }
}
