declare namespace RMMZ {
	interface Skill extends DataObj {
		id: number;
		animationId: number;
		damage: Damage;
		description: string;
		effects: Effect[];
		hitType: number;
		iconIndex: number;
		message1: string;
		message2: string;
		mpCost: number;
		name: string;
		occasion: number;
		repeats: number;
		requiredWtypeId1: number;
		requiredWtypeId2: number;
		scope: number;
		speed: number;
		stypeId: number;
		successRate: number;
		tpCost: number;
		tpGain: number;
		messageType: number;
	}
}
