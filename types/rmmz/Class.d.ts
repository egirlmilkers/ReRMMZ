declare namespace RMMZ {
	interface Class extends DataObj {
		id: number;
		expParams: [number, number, number, number];
		traits: Trait[];
		learnings: Learning[];
		name: string;
		params: number[][]; // TODO: possible fixed list length
	}
}
