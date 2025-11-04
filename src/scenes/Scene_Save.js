// Scene_Save
//
// The scene class of the save screen.

import { DataManager, SoundManager, TextManager } from '../managers/index.js';
import { Scene_File } from './Scene_File.js';

export class Scene_Save extends Scene_File {
    constructor() {
        super();
    }

    mode() {
        return "save";
    }

    helpWindowText() {
        return TextManager.saveMessage;
    }

    firstSavefileId() {
        return DataManager.$gameSystem.savefileId();
    }

    onSavefileOk() {
        super.onSavefileOk();
        const savefileId = this.savefileId();
        if (this.isSavefileEnabled(savefileId)) {
            this.executeSave(savefileId);
        } else {
            this.onSaveFailure();
        }
    }

    executeSave(savefileId) {
        DataManager.$gameSystem.setSavefileId(savefileId);
        DataManager.$gameSystem.onBeforeSave();
        DataManager.saveGame(savefileId)
            .then(() => this.onSaveSuccess())
            .catch(() => this.onSaveFailure());
    }

    onSaveSuccess() {
        SoundManager.playSave();
        this.popScene();
    }

    onSaveFailure() {
        SoundManager.playBuzzer();
        this.activateListWindow();
    }
}
