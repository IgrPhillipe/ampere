import { HttpResponse, http } from "msw";

import { UserEndpoints as e } from "../endpoints";
import type {
	ChangePasswordRequestPayload,
	ProfileRequestPayload,
} from "../types";

const url = (path: string) => `/api/${path}`;

export const mockProfileData = {
	id: "1",
	name: "Ana Carolina Lima",
	email: "ana.lima@exemplo.com.br",
	role: "user" as const,
	crea: "1684-D",
	creaState: "PE",
	company: "Lima Engenharia Elétrica",
	phone: "(81) 98821-4470",
};

export const userHandlers = [
	http.get(url(e.profile), () => HttpResponse.json({ data: mockProfileData })),

	http.put(url(e.profile), async ({ request }) => {
		const payload = (await request.json()) as ProfileRequestPayload;
		mockProfileData.name = payload.name;
		mockProfileData.crea = payload.crea ?? "";
		mockProfileData.creaState = payload.creaState ?? "";
		mockProfileData.company = payload.company ?? "";
		mockProfileData.phone = payload.phone ?? "";

		return HttpResponse.json({ data: mockProfileData });
	}),

	http.put(url(e.changePassword), async ({ request }) => {
		const payload = (await request.json()) as ChangePasswordRequestPayload;
		if (payload.currentPassword === "wrong-password") {
			return HttpResponse.json(
				{
					type: "about:blank",
					title: "Unprocessable Entity",
					status: 422,
					detail: "A senha atual está incorreta.",
					instance: `/${e.changePassword}`,
				},
				{ status: 422 },
			);
		}
		return new HttpResponse(null, { status: 204 });
	}),
];
