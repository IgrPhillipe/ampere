import { HttpResponse, http } from "msw";

import { ReviewQueueEndpoints as e } from "../endpoints";
import { reviewQueueFilterSchema } from "../schemas";
import {
	makeReviewQueue,
	makeReviewQueueIndicatorsResponse,
} from "./factories";
import { MOCK_REVIEW_QUEUE } from "./fixtures";

const url = (path: string) => `/api/${path}`;

const normalize = (value: string) =>
	value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();

const problem = (detail: string) =>
	HttpResponse.json(
		{
			type: "about:blank",
			title: "Bad Request",
			status: 400,
			detail,
			instance: `/${e.list}`,
		},
		{ status: 400 },
	);

export const reviewQueueHandlers = [
	http.get(url(e.list), ({ request }) => {
		const searchParams = new URL(request.url).searchParams;
		const page = Number(searchParams.get("page") ?? 1);
		const pageSize = Number(searchParams.get("pageSize") ?? 10);
		const search = normalize(searchParams.get("search")?.trim() ?? "");
		const parsedFilter = reviewQueueFilterSchema.safeParse(
			(searchParams.get("filter") ?? "ALL").toUpperCase(),
		);

		if (!Number.isInteger(page) || page < 1) {
			return problem("A página deve ser maior ou igual a 1.");
		}

		if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
			return problem("O tamanho da página deve estar entre 1 e 100.");
		}

		if (!parsedFilter.success) return problem("Filtro da fila inválido.");

		const filtered = MOCK_REVIEW_QUEUE.filter((item) => {
			if (
				parsedFilter.data === "DUE_SOON" &&
				item.deadlineStatus === "ON_TIME"
			) {
				return false;
			}

			if (
				parsedFilter.data === "HIGH_DEMAND" &&
				(item.demandKva === null || item.demandKva <= 50)
			) {
				return false;
			}

			if (parsedFilter.data === "REANALYSIS" && !item.reanalysis) {
				return false;
			}

			if (!search) return true;

			return [item.protocol, item.applicantName ?? "", item.municipality]
				.map(normalize)
				.join(" ")
				.includes(search);
		});

		const start = (page - 1) * pageSize;

		return HttpResponse.json(
			makeReviewQueue({
				items: filtered.slice(start, start + pageSize),
				total: filtered.length,
				page,
				pageSize,
			}),
		);
	}),

	http.get(url(e.indicators), () =>
		HttpResponse.json(makeReviewQueueIndicatorsResponse()),
	),
];
