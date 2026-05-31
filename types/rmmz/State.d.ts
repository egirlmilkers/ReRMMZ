declare namespace RMMZ {
	interface State extends DataObj {
		id: number;
		autoRemovalTiming: number;
		chanceByDamage: number;
		iconIndex: number;
		maxTurns: number;
		message1: string;
		message2: string;
		message3: string;
		message4: string;
		minTurns: number;
		motion: number;
		name: string;
		overlay: number;
		priority: number;
		removeAtBattleEnd: boolean;
		removeByDamage: boolean;
		removeByRestriction: boolean;
		removeByWalking: boolean;
		restriction: number;
		stepsToRemove: number;
		traits: Trait[];
		messageType: number;
	}
}
