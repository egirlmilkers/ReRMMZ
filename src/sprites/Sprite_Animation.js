// Sprite_Animation
//
// The sprite for displaying an animation.

import { Graphics } from "src/core/Graphics";
import { Point } from "src/core/Point";
import { Sprite } from "src/core/Sprite";

import { AudioManager } from "src/managers/AudioManager";
import { EffectManager } from "src/managers/EffectManager";


export class Sprite_Animation extends Sprite {
    constructor() {
        super();
        this.initMembers();
    }

    initMembers() {
        this._targets = [];
        this._animation = null;
        this._mirror = false;
        this._delay = 0;
        this._previous = null;
        this._effect = null;
        this._handle = null;
        this._playing = false;
        this._started = false;
        this._frameIndex = 0;
        this._maxTimingFrames = 0;
        this._flashColor = [0, 0, 0, 0];
        this._flashDuration = 0;
        this._viewportSize = 4096;
        this.z = 8;
    }

    destroy(options) {
        super.destroy(options);
        if (this._handle) {
            this._handle.stop();
        }
        this._effect = null;
        this._handle = null;
        this._playing = false;
        this._started = false;
    }

    // prettier-ignore
    setup(targets, animation, mirror, delay, previous) {
        this._targets = targets;
        this._animation = animation;
        this._mirror = mirror;
        this._delay = delay;
        this._previous = previous;
        this._effect = EffectManager.load(animation.effectName);
        this._playing = true;
        const timings = animation.soundTimings.concat(animation.flashTimings);
        for (const timing of timings) {
            if (timing.frame > this._maxTimingFrames) {
                this._maxTimingFrames = timing.frame;
            }
        }
    }

    update() {
        super.update();
        if (this._delay > 0) {
            this._delay--;
        } else if (this._playing) {
            if (!this._started && this.canStart()) {
                if (this._effect) {
                    if (this._effect.isLoaded) {
                        this._handle = Graphics.effekseer.play(this._effect);
                        this._started = true;
                    } else {
                        EffectManager.checkErrors();
                    }
                } else {
                    this._started = true;
                }
            }
            if (this._started) {
                this.updateEffectGeometry();
                this.updateMain();
                this.updateFlash();
            }
        }
    }

    canStart() {
        if (this._previous && this.shouldWaitForPrevious()) {
            return !this._previous.isPlaying();
        } else {
            return true;
        }
    }

    shouldWaitForPrevious() {
        // [Note] Older versions of Effekseer were very heavy on some mobile
        //   devices. We don't need this anymore.
        return false;
    }

    updateEffectGeometry() {
        const scale = this._animation.scale / 100;
        const r = Math.PI / 180;
        const rx = this._animation.rotation.x * r;
        const ry = this._animation.rotation.y * r;
        const rz = this._animation.rotation.z * r;
        if (this._handle) {
            this._handle.setLocation(0, 0, 0);
            this._handle.setRotation(rx, ry, rz);
            this._handle.setScale(scale, scale, scale);
            this._handle.setSpeed(this._animation.speed / 100);
        }
    }

    updateMain() {
        this.processSoundTimings();
        this.processFlashTimings();
        this._frameIndex++;
        this.checkEnd();
    }

    processSoundTimings() {
        for (const timing of this._animation.soundTimings) {
            if (timing.frame === this._frameIndex) {
                AudioManager.playSe(timing.se);
            }
        }
    }

    processFlashTimings() {
        for (const timing of this._animation.flashTimings) {
            if (timing.frame === this._frameIndex) {
                this._flashColor = timing.color.clone();
                this._flashDuration = timing.duration;
            }
        }
    }

    checkEnd() {
        if (this._frameIndex > this._maxTimingFrames && this._flashDuration === 0 && !(this._handle && this._handle.exists)) {
            this._playing = false;
        }
    }

    updateFlash() {
        if (this._flashDuration > 0) {
            const d = this._flashDuration--;
            this._flashColor[3] *= (d - 1) / d;
            for (const target of this._targets) {
                target.setBlendColor(this._flashColor);
            }
        }
    }

    isPlaying() {
        return this._playing;
    }

    setRotation(x, y, z) {
        if (this._handle) {
            this._handle.setRotation(x, y, z);
        }
    }

    _render(renderer) {
        if (this._targets.length > 0 && this._handle && this._handle.exists) {
            this.onBeforeRender(renderer);
            this.setProjectionMatrix(renderer);
            this.setCameraMatrix(renderer);
            this.setViewport(renderer);
            Graphics.effekseer.beginDraw();
            Graphics.effekseer.drawHandle(this._handle);
            Graphics.effekseer.endDraw();
            this.resetViewport(renderer);
            this.onAfterRender(renderer);
        }
    }

    setProjectionMatrix(renderer) {
        const x = this._mirror ? -1 : 1;
        const y = -1;
        const p = -(this._viewportSize / renderer.view.height);
        // prettier-ignore
        Graphics.effekseer.setProjectionMatrix([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, 1, p,
            0, 0, 0, 1,
        ]);
    }

    setCameraMatrix() /*renderer*/{
        // prettier-ignore
        Graphics.effekseer.setCameraMatrix([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, -10, 1
        ]);
    }

    setViewport(renderer) {
        const vw = this._viewportSize;
        const vh = this._viewportSize;
        const vx = this._animation.offsetX - vw / 2;
        const vy = this._animation.offsetY - vh / 2;
        const pos = this.targetPosition(renderer);
        renderer.gl.viewport(vx + pos.x, vy + pos.y, vw, vh);
    }

    targetPosition(renderer) {
        const pos = new Point();
        if (this._animation.displayType === 2) {
            pos.x = renderer.view.width / 2;
            pos.y = renderer.view.height / 2;
        } else {
            for (const target of this._targets) {
                const tpos = this.targetSpritePosition(target);
                pos.x += tpos.x;
                pos.y += tpos.y;
            }
            pos.x /= this._targets.length;
            pos.y /= this._targets.length;
        }
        return pos;
    }

    targetSpritePosition(sprite) {
        const point = new Point(0, -sprite.height / 2);
        if (this._animation.alignBottom) {
            point.y = 0;
        }
        sprite.updateTransform();
        return sprite.worldTransform.apply(point);
    }

    resetViewport(renderer) {
        renderer.gl.viewport(0, 0, renderer.view.width, renderer.view.height);
    }

    onBeforeRender(renderer) {
        renderer.batch.flush();
        renderer.geometry.reset();
    }

    onAfterRender(renderer) {
        renderer.texture.reset();
        renderer.geometry.reset();
        renderer.state.reset();
        renderer.shader.reset();
        renderer.framebuffer.reset();
    }
}
