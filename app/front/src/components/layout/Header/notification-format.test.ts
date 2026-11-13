import dayjs from "@lib/dayjs";
import { describe, expect, it } from "vitest";

import {
	formatNotificationAge,
	formatUnreadCount,
	formatUnreadLabel,
	toAppPath,
} from "./notification-format";

describe("notification format", () => {
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
		const origin = "http://localhost:5173";

		expect(toAppPath("/projetos/12/apontamentos", origin)).toBe(
			"/projetos/12/apontamentos",
		);
		expect(toAppPath("/fila-de-analise/12?aba=1#topo", origin)).toBe(
			"/fila-de-analise/12?aba=1#topo",
		);
		expect(toAppPath("http://localhost:5173/projetos/12", origin)).toBe(
			"/projetos/12",
		);
	});

	it("refuses a link that names another host", () => {
		const origin = "http://localhost:5173";

		for (const link of [
			"//evil.example",
			"/\\evil.example",
			"\\\\evil.example",
			"https://evil.example",
			"javascript:alert(1)",
			"http://[",
		]) {
			expect(toAppPath(link, origin), link).toBeNull();
		}
	});

	it("names the unread count for screen readers", () => {
		expect(formatUnreadLabel(0)).toBe("Notificações");
		expect(formatUnreadLabel(1)).toBe("Notificações, 1 não lida");
		expect(formatUnreadLabel(4)).toBe("Notificações, 4 não lidas");
	});

	it("writes the count in two digits and caps it", () => {
		expect(formatUnreadCount(7)).toBe("07");
		expect(formatUnreadCount(99)).toBe("99");
		expect(formatUnreadCount(100)).toBe("99+");
	});
});
