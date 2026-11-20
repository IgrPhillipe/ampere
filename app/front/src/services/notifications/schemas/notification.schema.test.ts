import { describe, expect, it } from "vitest";

import { notificationListResponseSchema } from "./notification.schema";

describe("notification API contract", () => {
	it("reads the manager's notice of a project waiting for an analyst", () => {
		const response = {
			data: {
				unreadCount: 1,
				items: [
					{
						id: "40",
						type: "PROJECT_UNASSIGNED",
						protocol: "2026-1002",
						projectId: "2",
						text: "Projeto 2026-1002 aguardando analista",
						link: "/fila-de-analise?reviewer=none",
						read: false,
						createdAt: "2026-11-20T16:16:59-03:00",
						readAt: null,
					},
				],
			},
		};

		expect(notificationListResponseSchema.parse(response)).toEqual(response);
	});
});
