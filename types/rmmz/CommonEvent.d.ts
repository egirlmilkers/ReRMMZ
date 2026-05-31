declare namespace RMMZ {
	interface CommonEvent {
		id: number;
		list: EventCommand[];
		name: string;
		switchId: number;
		trigger: number;
	}
}
