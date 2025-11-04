import { Bitmap } from "./Bitmap";
import { Graphics } from "./Graphics";
import { Point } from "./Point";
import { ScreenSprite } from "./ScreenSprite";
import { Sprite } from "./Sprite";

/**
 * The weather effect which displays rain, storm, or snow.
 *
 * @class
 * @extends PIXI.Container
 */
export class Weather extends PIXI.Container {
    constructor() {
        super();

        this._width = Graphics.width;
        this._height = Graphics.height;
        this._sprites = [];

        this._createBitmaps();
        this._createDimmer();

        /**
         * The type of the weather in ["none", "rain", "storm", "snow"].
         *
         * @type string
         */
        this.type = "none";

        /**
         * The power of the weather in the range (0, 9).
         *
         * @type number
         */
        this.power = 0;

        /**
         * The origin point of the weather for scrolling.
         *
         * @type Point
         */
        this.origin = new Point();
    }

    /**
     * Destroys the weather.
     */
    destroy() {
        const options = { children: true, texture: true };
        super.destroy(options);
        this._rainBitmap.destroy();
        this._stormBitmap.destroy();
        this._snowBitmap.destroy();
    }

    /**
     * Updates the weather for each frame.
     */
    update() {
        this._updateDimmer();
        this._updateAllSprites();
    }

    _createBitmaps() {
        this._rainBitmap = new Bitmap(1, 60);
        this._rainBitmap.fillAll("white");
        this._stormBitmap = new Bitmap(2, 100);
        this._stormBitmap.fillAll("white");
        this._snowBitmap = new Bitmap(9, 9);
        this._snowBitmap.drawCircle(4, 4, 4, "white");
    }

    _createDimmer() {
        this._dimmerSprite = new ScreenSprite();
        this._dimmerSprite.setColor(80, 80, 80);
        this.addChild(this._dimmerSprite);
    }

    _updateDimmer() {
        this._dimmerSprite.opacity = Math.floor(this.power * 6);
    }

    _updateAllSprites() {
        const maxSprites = Math.floor(this.power * 10);
        while (this._sprites.length < maxSprites) {
            this._addSprite();
        }
        while (this._sprites.length > maxSprites) {
            this._removeSprite();
        }
        for (const sprite of this._sprites) {
            this._updateSprite(sprite);
            sprite.x = sprite.ax - this.origin.x;
            sprite.y = sprite.ay - this.origin.y;
        }
    }

    _addSprite() {
        const sprite = new Sprite(this.viewport);
        sprite.opacity = 0;
        this._sprites.push(sprite);
        this.addChild(sprite);
    }

    _removeSprite() {
        this.removeChild(this._sprites.pop());
    }

    _updateSprite(sprite) {
        switch (this.type) {
            case "rain":
                this._updateRainSprite(sprite);
                break;
            case "storm":
                this._updateStormSprite(sprite);
                break;
            case "snow":
                this._updateSnowSprite(sprite);
                break;
        }
        if (sprite.opacity < 40) {
            this._rebornSprite(sprite);
        }
    }

    _updateRainSprite(sprite) {
        sprite.bitmap = this._rainBitmap;
        sprite.rotation = Math.PI / 16;
        sprite.ax -= 6 * Math.sin(sprite.rotation);
        sprite.ay += 6 * Math.cos(sprite.rotation);
        sprite.opacity -= 6;
    }

    _updateStormSprite(sprite) {
        sprite.bitmap = this._stormBitmap;
        sprite.rotation = Math.PI / 8;
        sprite.ax -= 8 * Math.sin(sprite.rotation);
        sprite.ay += 8 * Math.cos(sprite.rotation);
        sprite.opacity -= 8;
    }

    _updateSnowSprite(sprite) {
        sprite.bitmap = this._snowBitmap;
        sprite.rotation = Math.PI / 16;
        sprite.ax -= 3 * Math.sin(sprite.rotation);
        sprite.ay += 3 * Math.cos(sprite.rotation);
        sprite.opacity -= 3;
    }

    _rebornSprite(sprite) {
        sprite.ax = Math.randomInt(Graphics.width + 100) - 100 + this.origin.x;
        sprite.ay = Math.randomInt(Graphics.height + 200) - 200 + this.origin.y;
        sprite.opacity = 160 + Math.randomInt(60);
    }
}
