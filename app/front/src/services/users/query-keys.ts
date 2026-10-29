export const userKeys = {
	all: () => ["users"] as const,
	profile: () => [...userKeys.all(), "profile"] as const,
};
