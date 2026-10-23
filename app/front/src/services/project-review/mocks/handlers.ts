import { HttpResponse, http } from "msw";

import { ProjectReviewEndpoints as e } from "../endpoints";
import { findingStatusSchema } from "../schemas";
import { makeFindingListResponse, makeFindingResponse } from "./factories";
import { MOCK_FINDINGS } from "./fixtures";

const url = (path: string) => `/api/${path}`;

export const projectReviewHandlers = [
	http.get(url(e.findings(":projectId")), ({ params }) => {
		const findings = MOCK_FINDINGS.filter(
			(finding) => finding.projectId === params.projectId,
		);

		return HttpResponse.json(makeFindingListResponse(findings));
	}),
	http.put(
		url(e.response(":projectId", ":findingId")),
		async ({ params, request }) => {
			const payload = (await request.json()) as {
				status?: unknown;
				response?: unknown;
			};
			const status = findingStatusSchema.safeParse(payload.status);
			const finding = MOCK_FINDINGS.find(
				(item) =>
					item.projectId === params.projectId && item.id === params.findingId,
			);

			if (!finding) {
				return HttpResponse.json(
					{
						title: "Not Found",
						status: 404,
						detail: "Apontamento não encontrado.",
					},
					{ status: 404 },
				);
			}

			if (
				!status.success ||
				(status.data !== "FIXED" && status.data !== "CONTESTED")
			) {
				return HttpResponse.json(
					{ title: "Bad Request", status: 400, detail: "Situação inválida." },
					{ status: 400 },
				);
			}

			if (
				status.data === "CONTESTED" &&
				(typeof payload.response !== "string" || !payload.response.trim())
			) {
				return HttpResponse.json(
					{
						title: "Bad Request",
						status: 400,
						detail:
							"A justificativa é obrigatória para contestar o apontamento.",
					},
					{ status: 400 },
				);
			}

			finding.status = status.data;
			finding.response =
				typeof payload.response === "string" && payload.response.trim()
					? payload.response.trim()
					: null;
			finding.respondedAt = new Date().toISOString();

			return HttpResponse.json(makeFindingResponse(finding));
		},
	),
];
