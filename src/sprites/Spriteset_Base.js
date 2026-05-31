// Spriteset_Base
//
// The superclass of Spriteset_Map and Spriteset_Battle.

import { remove } from "../core/JsExtensions.js";
import { ColorFilter } from "../core/ColorFilter.js";
import { Graphics } from "../core/Graphics.js";
import { Rectangle } from "../core/Rectangle.js";
import { ScreenSprite } from "../core/ScreenSprite.js";
import { Sprite } from "../core/Sprite.js";

import { DataManager } from "../managers/DataManager.js";

import { Sprite_Animation } from "./Sprite_Animation.js";
import { Sprite_AnimationMV } from "./Sprite_AnimationMV.js";
import { Sprite_Picture } from "./Sprite_Picture.js";
import { Sprite_Timer } from "./Sprite_Timer.js";

export class Spriteset_Base extends Sprite {
	constructor() {
		super();
		this.setFrame(0, 0, Graphics.width, Graphics.height);
		this.loadSystemImages();
		this.createLowerLayer();
		this.createUpperLayer();
		this._animationSprites = [];
	}

	destroy(options) {
		this.removeAllAnimations();
		super.destroy(options);
	}

	loadSystemImages() {
		//
	}

	createLowerLayer() {
		this.createBaseSprite();
		this.createBaseFilters();
	}

	createUpperLayer() {
		this.createPictures();
		this.createTimer();
		this.createOverallFilters();
	}

	update() {
		super.update();
		this.updateBaseFilters();
		this.updateOverallFilters();
		this.updatePosition();
		this.updateAnimations();
	}

	createBaseSprite() {
		this._baseSprite = new Sprite();
		this._blackScreen = new ScreenSprite();
		this._blackScreen.opacity = 255;
		this.addChild(this._baseSprite);
		this._baseSprite.addChild(this._blackScreen);
	}

	createBaseFilters() {
		this._baseSprite.filters = [];
		this._baseColorFilter = new ColorFilter();
		this._baseSprite.filters.push(this._baseColorFilter);
	}

	createPictures() {
		const rect = this.pictureContainerRect();
		this._pictureContainer = new Sprite();
		this._pictureContainer.setFrame(
			rect.x,
			rect.y,
			rect.width,
			rect.height,
		);
		for (let i = 1; i <= DataManager.$gameScreen.maxPictures(); i++) {
			this._pictureContainer.addChild(new Sprite_Picture(i));
		}
		this.addChild(this._pictureContainer);
	}

	pictureContainerRect() {
		return new Rectangle(0, 0, Graphics.width, Graphics.height);
	}

	createTimer() {
		this._timerSprite = new Sprite_Timer();
		this.addChild(this._timerSprite);
	}

	createOverallFilters() {
		this.filters = [];
		this._overallColorFilter = new ColorFilter();
		this.filters.push(this._overallColorFilter);
	}

	updateBaseFilters() {
		const filter = this._baseColorFilter;
		filter.setColorTone(DataManager.$gameScreen.tone());
	}

	updateOverallFilters() {
		const filter = this._overallColorFilter;
		filter.setBlendColor(DataManager.$gameScreen.flashColor());
		filter.setBrightness(DataManager.$gameScreen.brightness());
	}

	updatePosition() {
		const screen = DataManager.$gameScreen;
		const scale = screen.zoomScale();
		this.scale.x = scale;
		this.scale.y = scale;
		this.x = Math.round(-screen.zoomX() * (scale - 1));
		this.y = Math.round(-screen.zoomY() * (scale - 1));
		this.x += Math.round(screen.shake());
	}

	findTargetSprite() /*target*/ {
		return null;
	}

	updateAnimations() {
		for (const sprite of this._animationSprites) {
			if (!sprite.isPlaying()) {
				this.removeAnimation(sprite);
			}
		}
		this.processAnimationRequests();
	}

	processAnimationRequests() {
		for (;;) {
			const request = DataManager.$gameTemp.retrieveAnimation();
			if (request) {
				this.createAnimation(request);
			} else {
				break;
			}
		}
	}

	createAnimation(request) {
		const animation = DataManager.$dataAnimations[request.animationId];
		const targets = request.targets;
		const mirror = request.mirror;
		let delay = this.animationBaseDelay();
		const nextDelay = this.animationNextDelay();
		if (this.isAnimationForEach(animation)) {
			for (const target of targets) {
				this.createAnimationSprite([target], animation, mirror, delay);
				delay += nextDelay;
			}
		} else {
			this.createAnimationSprite(targets, animation, mirror, delay);
		}
	}

	// prettier-ignore
	createAnimationSprite(targets, animation, mirror, delay) {
        const mv = this.isMVAnimation(animation);
        const sprite = new (mv ? Sprite_AnimationMV : Sprite_Animation)();
        const targetSprites = this.makeTargetSprites(targets);
        const baseDelay = this.animationBaseDelay();
        const previous = delay > baseDelay ? this.lastAnimationSprite() : null;
        if (this.animationShouldMirror(targets[0])) {
            mirror = !mirror;
        }
        sprite.targetObjects = targets;
        sprite.setup(targetSprites, animation, mirror, delay, previous);
        this._effectsContainer.addChild(sprite);
        this._animationSprites.push(sprite);
    }

	isMVAnimation(animation) {
		return !!animation.frames;
	}

	makeTargetSprites(targets) {
		const targetSprites = [];
		for (const target of targets) {
			const targetSprite = this.findTargetSprite(target);
			if (targetSprite) {
				targetSprites.push(targetSprite);
			}
		}
		return targetSprites;
	}

	lastAnimationSprite() {
		return this._animationSprites[this._animationSprites.length - 1];
	}

	isAnimationForEach(animation) {
		const mv = this.isMVAnimation(animation);
		return mv ? animation.position !== 3 : animation.displayType === 0;
	}

	animationBaseDelay() {
		return 8;
	}

	animationNextDelay() {
		return 12;
	}

	animationShouldMirror(target) {
		return target && target.isActor && target.isActor();
	}

	removeAnimation(sprite) {
		remove(this._animationSprites, sprite);
		this._effectsContainer.removeChild(sprite);
		for (const target of sprite.targetObjects) {
			if (target.endAnimation) {
				target.endAnimation();
			}
		}
		sprite.destroy();
	}

	removeAllAnimations() {
		for (const sprite of [...this._animationSprites]) {
			this.removeAnimation(sprite);
		}
	}

	isAnimationPlaying() {
		return this._animationSprites.length > 0;
	}
}
