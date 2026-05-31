declare namespace RMMZ {
	interface Actor extends DataObj {
		id: number;
		battlerName: string;
		characterIndex: number;
		characterName: string;
		classId: number;
		equips: number[];
		faceIndex: number;
		faceName: string;
		traits: Trait[];
		initialLevel: number;
		maxLevel: number;
		name: string;
		nickname: string;
		profile: string;
	}
}
