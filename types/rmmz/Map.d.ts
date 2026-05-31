declare namespace RMMZ {
	interface Map extends DataObj {
		autoplayBgm?: boolean;
		autoplayBgs?: boolean;
		battleback1Name?: string;
		battleback2Name?: string;
		bgm?: Audio;
		bgs?: Audio;
		disableDashing?: boolean;
		displayName?: string;
		encounterList?: Encounter[];
		encounterStep?: number;
		height: number;
		parallaxLoopX?: boolean;
		parallaxLoopY?: boolean;
		parallaxName?: string;
		parallaxShow?: boolean;
		parallaxSx?: number;
		parallaxSy?: number;
		scrollType: number;
		specifyBattleback?: boolean;
		tilesetId?: number;
		width: number;
		data: number[];
		events: (Event | null)[];
	}
}
