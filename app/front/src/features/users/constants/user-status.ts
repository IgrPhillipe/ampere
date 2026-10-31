export const USER_STATUSES = ["active", "inactive"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const userStatusLabels = {
	active: "Ativo",
	inactive: "Inativo",
} as const satisfies Record<UserStatus, string>;
