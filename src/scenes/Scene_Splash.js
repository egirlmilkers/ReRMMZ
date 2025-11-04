// Scene_Splash
//
// The scene class of the splash screen.

import { Input, Sprite, TouchInput } from '../core/index.js';
import { DataManager, ImageManager, SceneManager } from '../managers/index.js';
import { Scene_Base } from './Scene_Base.js';
import { Scene_Title } from './Scene_Title.js';

export class Scene_Splash extends Scene_Base {
    constructor() {
        super();
        this.initWaitCount();
    }

    create() {
        super.create();
        if (this.isEnabled()) {
            this.createBackground();
        }
    }

    start() {
        super.start();
        if (this.isEnabled()) {
            this.adjustBackground();
            this.startFadeIn(this.fadeSpeed(), false);
        }
    }

    update() {
        super.update();
        if (this.isActive()) {
            if (!this.updateWaitCount()) {
                this.gotoTitle();
            }
            this.checkSkip();
        }
    }

    stop() {
        super.stop();
        if (this.isEnabled()) {
            this.startFadeOut(this.fadeSpeed());
        }
    }

    createBackground() {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem("Splash");
        this.addChild(this._backSprite);
    }

    adjustBackground() {
        this.scaleSprite(this._backSprite);
        this.centerSprite(this._backSprite);
    }

    isEnabled() {
        return DataManager.$dataSystem.optSplashScreen;
    }

    initWaitCount() {
        if (this.isEnabled()) {
            this._waitCount = 120;
        } else {
            this._waitCount = 0;
        }
    }

    updateWaitCount() {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        }
        return false;
    }

    checkSkip() {
        if (Input.isTriggered("ok") || TouchInput.isTriggered()) {
            this._waitCount = 0;
        }
    }

    gotoTitle() {
        SceneManager.goto(Scene_Title);
    }
}
