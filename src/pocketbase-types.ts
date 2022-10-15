// Generated using pocketbase-typegen

export enum Collections {
	Profiles = "profiles",
	Scores = "scores",
}

export type ProfilesRecord = {
	userId: string;
	name?: string;
	avatar?: string;
	avatarUrl?: string;
	authProvider: string;
	cheater?: boolean;
}

export type ScoresRecord = {
	displayName: string;
	gameImage?: string;
	avatarUrl?: string;
	score: number;
	timestamp: string;
	user: string;
	authProvider: string;
}