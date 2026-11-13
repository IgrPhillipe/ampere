import dayjs from "@lib/dayjs";
import { describe, expect, it } from "vitest";

import {
	formatNotificationAge,
	formatUnreadBadge,
	formatUnreadLabel,
	isAppLink,
} from "./notification-row";

describe("notification row", () => {
	const now = dayjs("2026-11-13T15:00:00-03:00");

	it("tells how long ago, in Portuguese", () => {
		expect(formatNotificationAge("2026-11-13T13:00:00-03:00", now)).toBe(
			"há 2 horas",
		);
		expect(formatNotificationAge("2026-11-08T15:00:00-03:00", now)).toBe(
			"há 5 dias",
		);
	});

	it("follows only routes of the app", () => {
		expect(isAppLink("/projetos/12/apontamentos")).toBe(true);
		expect(isAppLink("//evil.example")).toBe(false);
		expect(isAppLink("https://evil.example")).toBe(false);
	});

	it("names the unread count for screen readers", () => {
		expect(formatUnreadLabel(0)).toBe("Notificações");
		expect(formatUnreadLabel(1)).toBe("Notificações, 1 não lida");
		expect(formatUnreadLabel(4)).toBe("Notificações, 4 não lidas");
	});

	it("caps the badge", () => {
		expect(formatUnreadBadge(7)).toBe("7");
		expect(formatUnreadBadge(120)).toBe("99+");
	});
});
