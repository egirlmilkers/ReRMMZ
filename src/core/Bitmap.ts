import * as PIXI from "pixi.js";
import { Graphics, Rectangle, Stage, Utils } from "../core/index.js";

/**
 * The basic object that represents an image.
 */
export class Bitmap {
	private _canvas: HTMLCanvasElement | null = null;
	private _context: CanvasRenderingContext2D | null = null;
	private _baseTexture: PIXI.BaseTexture | null = null;
	private _image: HTMLImageElement | null = null;
	private _url: string = "";
	private _paintOpacity: number = 255;
	private _smooth: boolean = true;
	private _loadListeners: Function[] = [];
	private _loadingState: "none" | "loading" | "loaded" | "error" = "none";

	// The face name of the font.
	fontFace: string = "sans-serif";

	// The size of the font in pixels.
	fontSize: number = 16;

	// Whether the font is bold.
	fontBold: boolean = false;

	// Whether the font is italic.
	fontItalic: boolean = false;

	// The color of the text in CSS format.
	textColor: string = "#ffffff";

	// The color of the outline of the text in CSS format.
	outlineColor: string = "rgba(0, 0, 0, 0.5)";

	// The width of the outline of the text.
	outlineWidth: number = 3;

	/**
	 * @param width The width of the bitmap.
	 * @param height The height of the bitmap.
	 */
	constructor(width: number = 0, height: number = 0) {
		if (width > 0 && height > 0) {
			this._createCanvas(width, height);
		}
	}

	/**
	 * Loads a image file.
	 * @param url The image url of the texture.
	 * @returns The new bitmap object.
	 */
	static load(url: string): Bitmap {
		const bitmap = new Bitmap();
		bitmap._url = url;
		bitmap._startLoading();
		return bitmap;
	}

	/**
	 * Takes a snapshot of the game screen.
	 * @param stage The stage object.
	 * @returns The new bitmap object.
	 */
	static snap(stage: Stage): Bitmap {
		const width = Graphics.width;
		const height = Graphics.height;
		const bitmap = new Bitmap(width, height);
		const renderTexture = PIXI.RenderTexture.create({width, height});
		if (stage) {
			const renderer = Graphics.app.renderer;
			renderer.render(stage, renderTexture);
			stage.worldTransform.identity();
			const canvas = renderer.extract.canvas(renderTexture);
			bitmap.context.drawImage(canvas, 0, 0);
			canvas.width = 0;
			canvas.height = 0;
		}
		renderTexture.destroy(true);
		bitmap.baseTexture.update();
		return bitmap;
	}

	/**
	 * Checks whether the bitmap is ready to render.
	 * @returns True if the bitmap is ready to render.
	 */
	isReady(): boolean {
		return this._loadingState === "loaded" || this._loadingState === "none";
	}

	/**
	 * Checks whether a loading error has occurred.
	 * @returns True if a loading error has occurred.
	 */
	isError(): boolean {
		return this._loadingState === "error";
	}

	/**
	 * The url of the image file.
	 */
	public get url(): string {
		return this._url;
	}

	/**
	 * The base texture that holds the image.
	 */
	get baseTexture(): PIXI.BaseTexture {
		return this._baseTexture!;
	}

	/**
	 * The bitmap image.
	 */
	get image(): HTMLImageElement {
		return this._image!;
	}

	/**
	 * The bitmap canvas.
	 */
	get canvas(): HTMLCanvasElement {
		this._ensureCanvas();
		return this._canvas!;
	}

	/**
	 * The 2d context of the bitmap canvas.
	 */
	get context(): CanvasRenderingContext2D {
		this._ensureCanvas();
		return this._context!;
	}

	/**
	 * The width of the bitmap.
	 */
	get width(): number {
		const image = this._canvas || this._image;
		return image ? image.width : 0;
	}

	/**
	 * The height of the bitmap.
	 */
	get height(): number {
		const image = this._canvas || this._image;
		return image ? image.height : 0;
	}

	/**
	 * The rectangle of the bitmap.
	 */
	get rect(): Rectangle {
		return new Rectangle(0, 0, this.width, this.height);
	}

	/**
	 * Whether the smooth scaling is applied.
	 */
	get smooth(): boolean {
		return this._smooth;
	}

	set smooth(value: boolean) {
		if (this._smooth !== value) {
			this._smooth = value;
			this._updateScaleMode();
		}
	}

	/**
	 * The opacity of the drawing object in the range (0, 255).
	 */
	get paintOpacity(): number {
		return this._paintOpacity;
	}

	set paintOpacity(value: number) {
		if (this._paintOpacity !== value) {
			this._paintOpacity = value;
			this.context.globalAlpha = this._paintOpacity / 255;
		}
	}

	/**
	 * Destroys the bitmap.
	 */
	destroy(): void {
		if (this._baseTexture) {
			this._baseTexture.destroy();
			this._baseTexture = null;
		}
		this._destroyCanvas();
	}

	/**
	 * Resizes the bitmap.
	 * @param width The new width of the bitmap.
	 * @param height The new height of the bitmap.
	 */
	resize(width: number, height: number): void {
		width = Math.max(width || 0, 1);
		height = Math.max(height || 0, 1);
		this.canvas.width = width;
		this.canvas.height = height;
		// this.baseTexture.width = width;
		// this.baseTexture.height = height;
	}

	/**
	 * Performs a block transfer.
	 * @param source - The bitmap to draw.
	 * @param sx The x coordinate in the source.
	 * @param sy The y coordinate in the source.
	 * @param sw The width of the source image.
	 * @param sh The height of the source image.
	 * @param dx The x coordinate in the destination.
	 * @param dy The y coordinate in the destination.
	 * @param dw The width to draw the image in the destination.
	 * @param dh The height to draw the image in the destination.
	 */
	blt(source: Bitmap, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number = sw, dh: number = sh): void {
		// dw = dw || sw;
		// dh = dh || sh;
		try {
			const image = source._canvas ?? source._image!;
			this.context.globalCompositeOperation = "source-over";
			this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
			this._baseTexture!.update();
		} catch (e) {
			//
		}
	}

	/**
	 * Returns pixel color at the specified point.
	 * @param x The x coordinate of the pixel in the bitmap.
	 * @param y The y coordinate of the pixel in the bitmap.
	 * @returns The pixel color (hex format).
	 */
	getPixel(x: number, y: number): string {
		const data = this.context.getImageData(x, y, 1, 1).data;
		let result = "#";
		for (let i = 0; i < 3; i++) {
			result += data[i].toString(16).padStart(2, "0");
		}
		return result;
	}

	/**
	 * Returns alpha pixel value at the specified point.
	 * @param x The x coordinate of the pixel in the bitmap.
	 * @param y The y coordinate of the pixel in the bitmap.
	 * @returns The alpha value.
	 */
	getAlphaPixel(x: number, y: number): number {
		const data = this.context.getImageData(x, y, 1, 1).data;
		return data[3];
	}

	/**
	 * Clears the specified rectangle.
	 * @param x The x coordinate for the upper-left corner.
	 * @param y The y coordinate for the upper-left corner.
	 * @param width The width of the rectangle to clear.
	 * @param height The height of the rectangle to clear.
	 */
	clearRect(x: number, y: number, width: number, height: number): void {
		this.context.clearRect(x, y, width, height);
		this._baseTexture!.update();
	}

	/**
	 * Clears the entire bitmap.
	 */
	clear(): void {
		this.clearRect(0, 0, this.width, this.height);
	}

	/**
	 * Fills the specified rectangle.
	 * @param x The x coordinate for the upper-left corner.
	 * @param y The y coordinate for the upper-left corner.
	 * @param width The width of the rectangle to fill.
	 * @param height The height of the rectangle to fill.
	 * @param color The color of the rectangle in CSS format.
	 */
	fillRect(x: number, y: number, width: number, height: number, color: string): void {
		const context = this.context;
		context.save();
		context.fillStyle = color;
		context.fillRect(x, y, width, height);
		context.restore();
		this._baseTexture!.update();
	}

	/**
	 * Fills the entire bitmap.
	 * @param color The color of the rectangle in CSS format.
	 */
	fillAll(color: string): void {
		this.fillRect(0, 0, this.width, this.height, color);
	}

	/**
	 * Draws the specified rectangular frame.
	 * @param x The x coordinate for the upper-left corner.
	 * @param y The y coordinate for the upper-left corner.
	 * @param width The width of the rectangle to fill.
	 * @param height The height of the rectangle to fill.
	 * @param color The color of the rectangle in CSS format.
	 */
	strokeRect(x: number, y: number, width: number, height: number, color: string): void {
		const context = this.context;
		context.save();
		context.strokeStyle = color;
		context.strokeRect(x, y, width, height);
		context.restore();
		this._baseTexture!.update();
	}

	/**
	 * Draws the rectangle with a gradation.
	 * @param x The x coordinate for the upper-left corner.
	 * @param y The y coordinate for the upper-left corner.
	 * @param width The width of the rectangle to fill.
	 * @param height The height of the rectangle to fill.
	 * @param color1 The gradient starting color.
	 * @param color2 The gradient ending color.
	 * @param vertical Whether the gradient should be draw as vertical or not.
	 */
	gradientFillRect(x: number, y: number, width: number, height: number, color1: string, color2: string, vertical: boolean): void {
		const context = this.context;
		const x1 = vertical ? x : x + width;
		const y1 = vertical ? y + height : y;
		const grad = context.createLinearGradient(x, y, x1, y1);
		grad.addColorStop(0, color1);
		grad.addColorStop(1, color2);
		context.save();
		context.fillStyle = grad;
		context.fillRect(x, y, width, height);
		context.restore();
		this._baseTexture!.update();
	}

	/**
	 * Draws a bitmap in the shape of a circle.
	 * @param x The x coordinate based on the circle center.
	 * @param y The y coordinate based on the circle center.
	 * @param radius The radius of the circle.
	 * @param color The color of the circle in CSS format.
	 */
	drawCircle(x: number, y: number, radius: number, color: string): void {
		const context = this.context;
		context.save();
		context.fillStyle = color;
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2, false);
		context.fill();
		context.restore();
		this._baseTexture!.update();
	}

	/**
	 * Draws the outline text to the bitmap.
	 * @param text The text that will be drawn.
	 * @param x The x coordinate for the left of the text.
	 * @param y The y coordinate for the top of the text.
	 * @param maxWidth The maximum allowed width of the text.
	 * @param lineHeight The height of the text line.
	 * @param align The alignment of the text.
	 */
	drawText(text: string, x: number, y: number, maxWidth: number, lineHeight: number, align: string): void {
		// [Note] Different browser makes different rendering with
		//   textBaseline == 'top'. So we use 'alphabetic' here.
		const context = this.context;
		const alpha = context.globalAlpha;
		maxWidth = maxWidth || 0xffffffff;
		let tx = x;
		const ty = Math.round(y + lineHeight / 2 + this.fontSize * 0.35);
		if (align === "center") {
			tx += maxWidth / 2;
		}
		if (align === "right") {
			tx += maxWidth;
		}
		context.save();
		context.font = this._makeFontNameText();
		context.textAlign = align as CanvasTextAlign;
		context.textBaseline = "alphabetic";
		context.globalAlpha = 1;
		this._drawTextOutline(text, tx, ty, maxWidth);
		context.globalAlpha = alpha;
		this._drawTextBody(text, tx, ty, maxWidth);
		context.restore();
		this._baseTexture!.update();
	}

	/**
	 * Returns the width of the specified text.
	 * @param text The text to be measured.
	 * @returns The width of the text in pixels.
	 */
	measureTextWidth(text: string): number {
		const context = this.context;
		context.save();
		context.font = this._makeFontNameText();
		const width = context.measureText(text).width;
		context.restore();
		return width;
	}

	/**
	 * Adds a callback function that will be called when the bitmap is loaded.
	 * @param listener The callback function.
	 */
	addLoadListener(listener: Function): void {
		if (!this.isReady()) {
			this._loadListeners.push(listener);
		} else {
			listener(this);
		}
	}

	/**
	 * Tries to load the image again.
	 */
	retry(): void {
		this._startLoading();
	}

	private _makeFontNameText(): string {
		const italic = this.fontItalic ? "Italic " : "";
		const bold = this.fontBold ? "Bold " : "";
		return `${italic}${bold}${this.fontSize}px ${this.fontFace}`;
	}

	private _drawTextOutline(text: string, tx: number, ty: number, maxWidth: number): void {
		const context = this.context;
		context.strokeStyle = this.outlineColor;
		context.lineWidth = this.outlineWidth;
		context.lineJoin = "round";
		context.strokeText(text, tx, ty, maxWidth);
	}

	private _drawTextBody(text: string, tx: number, ty: number, maxWidth: number): void {
		const context = this.context;
		context.fillStyle = this.textColor;
		context.fillText(text, tx, ty, maxWidth);
	}

	private _createCanvas(width: number, height: number): void {
		this._canvas = document.createElement("canvas");
		this._context = this._canvas.getContext("2d");
		this._canvas.width = width;
		this._canvas.height = height;
		this._createBaseTexture(this._canvas);
	}

	private _ensureCanvas(): void {
		if (!this._canvas) {
			if (this._image) {
				this._createCanvas(this._image.width, this._image.height);
				this._context!.drawImage(this._image, 0, 0);
			} else {
				this._createCanvas(0, 0);
			}
		}
	}

	private _destroyCanvas(): void {
		if (this._canvas) {
			this._canvas.width = 0;
			this._canvas.height = 0;
			this._canvas = null;
		}
	}

	private _createBaseTexture(source: HTMLImageElement | HTMLCanvasElement): void {
		this._baseTexture = new PIXI.BaseTexture(source);
		this._baseTexture.mipmap = PIXI.MIPMAP_MODES.OFF;
		// this._baseTexture.width = source.width;
		// this._baseTexture.height = source.height;
		this._updateScaleMode();
	}

	private _updateScaleMode(): void {
		if (this._baseTexture) {
			if (this._smooth) {
				this._baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
			} else {
				this._baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
			}
		}
	}

	private _startLoading(): void {
		this._image = new Image();
		this._image.onload = this._onLoad.bind(this);
		this._image.onerror = this._onError.bind(this);
		this._destroyCanvas();
		this._loadingState = "loading";
		if (Utils.hasEncryptedImages()) {
			this._startDecrypting();
		} else {
			this._image.src = this._url;
			if (this._image.width > 0) {
				this._image.onload = null;
				this._onLoad();
			}
		}
	}

	private _startDecrypting(): void {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", this._url + "_");
		xhr.responseType = "arraybuffer";
		xhr.onload = () => this._onXhrLoad(xhr);
		xhr.onerror = this._onError.bind(this);
		xhr.send();
	}

	private _onXhrLoad(xhr: XMLHttpRequest): void {
		if (xhr.status < 400) {
			const arrayBuffer = Utils.decryptArrayBuffer(xhr.response);
			const blob = new Blob([arrayBuffer]);
			this._image!.src = URL.createObjectURL(blob);
		} else {
			this._onError();
		}
	}

	private _onLoad(): void {
		if (Utils.hasEncryptedImages()) {
			URL.revokeObjectURL(this._image!.src);
		}
		this._loadingState = "loaded";
		this._createBaseTexture(this._image!);
		this._callLoadListeners();
	}

	private _callLoadListeners(): void {
		while (this._loadListeners.length > 0) {
			const listener = this._loadListeners.shift()!;
			listener(this);
		}
	}

	private _onError(): void {
		this._loadingState = "error";
	}
}
