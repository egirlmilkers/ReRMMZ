// Spriteset_Map
//
// The set of sprites on the map screen.

import { Graphics } from "../core/Graphics.js";
import { Sprite } from "../core/Sprite.js";
import { Tilemap } from "../core/Tilemap.js";
import { TilingSprite } from "../core/TilingSprite.js";
import { Weather } from "../core/Weather.js";

import { DataManager } from "../managers/DataManager.js";
import { ImageManager } from "../managers/ImageManager.js";

import { Sprite_Balloon } from "./Sprite_Balloon.js";
import { Sprite_Character } from "./Sprite_Character.js";
import { Sprite_Destination } from "./Sprite_Destination.js";
import { Spriteset_Base } from "./Spriteset_Base.js";

export class Spriteset_Map extends Spriteset_Base {
	constructor() {
		super();
		this._balloonSprites = [];
	}

	destroy(options) {
		this.removeAllBalloons();
		super.destroy(options);
	}

	loadSystemImages() {
		super.loadSystemImages();
		ImageManager.loadSystem("Balloon");
		ImageManager.loadSystem("Shadow1");
	}

	createLowerLayer() {
		super.createLowerLayer();
		this.createParallax();
		this.createTilemap();
		this.createCharacters();
		this.createShadow();
		this.createDestination();
		this.createWeather();
	}

	update() {
		super.update();
		this.updateTileset();
		this.updateParallax();
		this.updateTilemap();
		this.updateShadow();
		this.updateWeather();
		this.updateAnimations();
		this.updateBalloons();
	}

	hideCharacters() {
		for (const sprite of this._characterSprites) {
			if (!sprite.isTile() && !sprite.isObjectCharacter()) {
				sprite.hide();
			}
		}
	}

	createParallax() {
		this._parallax = new TilingSprite();
		this._parallax.move(0, 0, Graphics.width, Graphics.height);
		this._baseSprite.addChild(this._parallax);
	}

	createTilemap() {
		const tilemap = new Tilemap();
		tilemap.tileWidth = DataManager.$gameMap.tileWidth();
		tilemap.tileHeight = DataManager.$gameMap.tileHeight();
		tilemap.setData(
			DataManager.$gameMap.width(),
			DataManager.$gameMap.height(),
			DataManager.$gameMap.data(),
		);
		tilemap.horizontalWrap = DataManager.$gameMap.isLoopHorizontal();
		tilemap.verticalWrap = DataManager.$gameMap.isLoopVertical();
		this._baseSprite.addChild(tilemap);
		this._effectsContainer = tilemap;
		this._tilemap = tilemap;
		this.loadTileset();
	}

	loadTileset() {
		this._tileset = DataManager.$gameMap.tileset();
		if (this._tileset) {
			const bitmaps = [];
			const tilesetNames = this._tileset.tilesetNames;
			for (const name of tilesetNames) {
				bitmaps.push(ImageManager.loadTileset(name));
			}
			this._tilemap.setBitmaps(bitmaps);
			this._tilemap.flags = DataManager.$gameMap.tilesetFlags();
		}
	}

	createCharacters() {
		this._characterSprites = [];
		for (const event of DataManager.$gameMap.events()) {
			this._characterSprites.push(new Sprite_Character(event));
		}
		for (const vehicle of DataManager.$gameMap.vehicles()) {
			this._characterSprites.push(new Sprite_Character(vehicle));
		}
		for (const follower of DataManager.$gamePlayer
			.followers()
			.reverseData()) {
			this._characterSprites.push(new Sprite_Character(follower));
		}
		this._characterSprites.push(
			new Sprite_Character(DataManager.$gamePlayer),
		);
		for (const sprite of this._characterSprites) {
			this._tilemap.addChild(sprite);
		}
	}

	createShadow() {
		this._shadowSprite = new Sprite();
		this._shadowSprite.bitmap = ImageManager.loadSystem("Shadow1");
		this._shadowSprite.anchor.x = 0.5;
		this._shadowSprite.anchor.y = 1;
		this._shadowSprite.z = 6;
		this._tilemap.addChild(this._shadowSprite);
	}

	createDestination() {
		this._destinationSprite = new Sprite_Destination();
		this._destinationSprite.z = 9;
		this._tilemap.addChild(this._destinationSprite);
	}

	createWeather() {
		this._weather = new Weather();
		this.addChild(this._weather);
	}

	updateTileset() {
		if (this._tileset !== DataManager.$gameMap.tileset()) {
			this.loadTileset();
		}
	}

	updateParallax() {
		if (this._parallaxName !== DataManager.$gameMap.parallaxName()) {
			this._parallaxName = DataManager.$gameMap.parallaxName();
			this._parallax.bitmap = ImageManager.loadParallax(
				this._parallaxName,
			);
		}
		if (this._parallax.bitmap) {
			const bitmap = this._parallax.bitmap;
			this._parallax.origin.x =
				DataManager.$gameMap.parallaxOx() % bitmap.width;
			this._parallax.origin.y =
				DataManager.$gameMap.parallaxOy() % bitmap.height;
		}
	}

	updateTilemap() {
		this._tilemap.origin.x =
			DataManager.$gameMap.displayX() * DataManager.$gameMap.tileWidth();
		this._tilemap.origin.y =
			DataManager.$gameMap.displayY() * DataManager.$gameMap.tileHeight();
	}

	updateShadow() {
		const airship = DataManager.$gameMap.airship();
		this._shadowSprite.x = airship.shadowX();
		this._shadowSprite.y = airship.shadowY();
		this._shadowSprite.opacity = airship.shadowOpacity();
	}

	updateWeather() {
		this._weather.type = DataManager.$gameScreen.weatherType();
		this._weather.power = DataManager.$gameScreen.weatherPower();
		this._weather.origin.x =
			DataManager.$gameMap.displayX() * DataManager.$gameMap.tileWidth();
		this._weather.origin.y =
			DataManager.$gameMap.displayY() * DataManager.$gameMap.tileHeight();
	}

	updateBalloons() {
		for (const sprite of this._balloonSprites) {
			if (!sprite.isPlaying()) {
				this.removeBalloon(sprite);
			}
		}
		this.processBalloonRequests();
	}

	processBalloonRequests() {
		for (;;) {
			const request = DataManager.$gameTemp.retrieveBalloon();
			if (request) {
				this.createBalloon(request);
			} else {
				break;
			}
		}
	}

	createBalloon(request) {
		const targetSprite = this.findTargetSprite(request.target);
		if (targetSprite) {
			const sprite = new Sprite_Balloon();
			sprite.targetObject = request.target;
			sprite.setup(targetSprite, request.balloonId);
			this._effectsContainer.addChild(sprite);
			this._balloonSprites.push(sprite);
		}
	}

	removeBalloon(sprite) {
		this._balloonSprites.remove(sprite);
		this._effectsContainer.removeChild(sprite);
		if (sprite.targetObject.endBalloon) {
			sprite.targetObject.endBalloon();
		}
		sprite.destroy();
	}

	removeAllBalloons() {
		for (const sprite of this._balloonSprites.clone()) {
			this.removeBalloon(sprite);
		}
	}

	findTargetSprite(target) {
		return this._characterSprites.find((sprite) =>
			sprite.checkCharacter(target),
		);
	}

	animationBaseDelay() {
		return 0;
	}
}
