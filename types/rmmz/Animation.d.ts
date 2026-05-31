declare namespace RMMZ {
	interface Animation {
		id: number;
		displayType: number;
		effectName: string;
		flashTimings: FlashTiming[];
		name: string;
		offsetX: number;
		offsetY: number;
		rotation: Vector3;
		scale: number;
		soundTimings: SoundTiming[];
		speed: number;

	}
}