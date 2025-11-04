// Scene_Load
//
// The scene class of the load screen.

import { DataManager, SceneManager, SoundManager, TextManager } from '../managers/index.js';
import { Scene_File } from './Scene_File.js';
import { Scene_Map } from './Scene_Map.js';

export class Scene_Load extends Scene_File {
    constructor() {
        super();
        this._loadSuccess = false;
    }

    terminate() {
        super.terminate();
        if (this._loadSuccess) {
            DataManager.$gameSystem.onAfterLoad();
        }
    }

    mode() {
        return "load";
    }

    helpWindowText() {
        return TextManager.loadMessage;
    }

    firstSavefileId() {
        return DataManager.latestSavefileId();
    }

    onSavefileOk() {
        super.onSavefileOk();
        const savefileId = this.savefileId();
        if (this.isSavefileEnabled(savefileId)) {
            this.executeLoad(savefileId);
        } else {
            this.onLoadFailure();
        }
    }

    executeLoad(savefileId) {
        DataManager.loadGame(savefileId)
            .then(() => this.onLoadSuccess())
            .catch(() => this.onLoadFailure());
    }

    onLoadSuccess() {
        SoundManager.playLoad();
        this.fadeOutAll();
        this.reloadMapIfUpdated();
        SceneManager.goto(Scene_Map);
        this._loadSuccess = true;
    }

    onLoadFailure() {
        SoundManager.playBuzzer();
        this.activateListWindow();
    }

    reloadMapIfUpdated() {
        if (DataManager.$gameSystem.versionId() !== DataManager.$dataSystem.versionId) {
            const mapId = DataManager.$gameMap.mapId();
            const x = DataManager.$gamePlayer.x;
            const y = DataManager.$gamePlayer.y;
            const d = DataManager.$gamePlayer.direction();
            DataManager.$gamePlayer.reserveTransfer(mapId, x, y, d, 0);
            DataManager.$gamePlayer.requestMapReload();
        }
    }
}
