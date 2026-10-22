import { sortDirectionSchema } from "@features/shared";
import { HttpResponse, http } from "msw";

import { ReviewQueueEndpoints as e } from "../endpoints";
import {
	type ReviewQueueItem,
	type ReviewQueueSort,
	reviewQueueFilterSchema,
	reviewQueueSortSchema,
	UNASSIGNED_REVIEWER,
} from "../schemas";
import { MOCK_QUEUE, MOCK_REVIEWERS } from "./fixtures";

const url = (path: string) => `/api/${path}`;

const ADMIN_TOKEN = "mock-token-2";

const normalize = (value: string) =>
	value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();

const problem = (status: 400 | 403, detail: string, instance: string) =>
	HttpResponse.json(
		{
			type: "about:blank",
			title: status === 400 ? "Bad Request" : "Forbidden",
			status,
			detail,
			instance: `/${instance}`,
		},
		{ status },
	);

const isAdmin = (request: Request) =>
	request.headers.get("Authorization") === `Bearer ${ADMIN_TOKEN}`;

const sortValue: Record<
	ReviewQueueSort,
	(item: ReviewQueueItem) => number | string
> = {
	deadline: (item) => item.deadline,
	submittedAt: (item) => item.submittedAt,
	demand: (item) => item.demandKva ?? -1,
	warnings: (item) => item.warnings,
};

const toItem = ({
	reviewerId: _reviewerId,
	...item
}: (typeof MOCK_QUEUE)[number]): ReviewQueueItem => item;

export const reviewQueueHandlers = [
	http.get(url(e.list), ({ request }) => {
		if (!isAdmin(request)) {
			return problem(403, "Acesso restrito a analistas.", e.list);
		}

		const searchParams = new URL(request.url).searchParams;
		const page = Number(searchParams.get("page") ?? 1);
		const pageSize = Number(searchParams.get("pageSize") ?? 20);
		const search = normalize(searchParams.get("search")?.trim() ?? "");
		const filter = reviewQueueFilterSchema.safeParse(
			searchParams.get("filter") ?? "ALL",
		);
		const sort = reviewQueueSortSchema.safeParse(
			searchParams.get("sort") ?? "deadline",
		);
		const direction = sortDirectionSchema.safeParse(
			searchParams.get("direction") ?? "ASC",
		);
		const reviewer = searchParams.get("reviewer");
		const municipality = searchParams.get("municipality")?.trim();

		if (!filter.success) return problem(400, "Filtro inválido.", e.list);
		if (!sort.success) return problem(400, "Ordenação inválida.", e.list);
		if (!direction.success) {
			return problem(400, "Direção de ordenação inválida.", e.list);
		}
		if (
			reviewer &&
			reviewer !== UNASSIGNED_REVIEWER &&
			!/^\d+$/.test(reviewer)
		) {
			return problem(400, "Analista inválido.", e.list);
		}

		const filtered = MOCK_QUEUE.filter((item) => {
			if (filter.data === "DUE_SOON" && item.deadlineStatus === "ON_TIME") {
				return false;
			}
			if (filter.data === "HIGH_DEMAND" && (item.demandKva ?? 0) <= 50) {
				return false;
			}
			if (filter.data === "REANALYSIS" && !item.reanalysis) return false;

			if (reviewer === UNASSIGNED_REVIEWER && item.reviewerId !== null) {
				return false;
			}
			if (
				reviewer &&
				reviewer !== UNASSIGNED_REVIEWER &&
				item.reviewerId !== reviewer
			) {
				return false;
			}

			if (
				municipality &&
				item.municipality.toLowerCase() !== municipality.toLowerCase()
			) {
				return false;
			}

			if (!search) return true;

			return [item.protocol, item.ownerName ?? "", item.municipality]
				.map(normalize)
				.join(" ")
				.includes(search);
		});

		const value = sortValue[sort.data];
		const sign = direction.data === "ASC" ? 1 : -1;
		const sorted = filtered.toSorted((a, b) => {
			const left = value(a);
			const right = value(b);

			return left === right ? 0 : left < right ? -sign : sign;
		});

		const start = (page - 1) * pageSize;

		return HttpResponse.json({
			data: sorted.slice(start, start + pageSize).map(toItem),
			pagination: { page, pageSize, total: filtered.length },
		});
	}),

	http.get(url(e.indicators), () =>
		HttpResponse.json({
			data: {
				total: MOCK_QUEUE.length,
				dueSoon: MOCK_QUEUE.filter((item) => item.deadlineStatus !== "ON_TIME")
					.length,
				highDemand: MOCK_QUEUE.filter((item) => (item.demandKva ?? 0) > 50)
					.length,
				reanalysis: MOCK_QUEUE.filter((item) => item.reanalysis).length,
				reviewedToday: 2,
				monthlyRejectionPercent: 37.5,
			},
		}),
	),

	http.get(url(e.reviewers), ({ request }) =>
		isAdmin(request)
			? HttpResponse.json({ data: MOCK_REVIEWERS })
			: problem(403, "Acesso restrito a analistas.", e.reviewers),
	),
];
