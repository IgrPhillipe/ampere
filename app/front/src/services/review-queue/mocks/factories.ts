import type {
	ReviewQueueIndicators,
	ReviewQueueIndicatorsResponse,
	ReviewQueueItem,
	ReviewQueueListResponse,
} from "../schemas";
import { MOCK_REVIEW_QUEUE } from "./fixtures";

export const makeReviewQueueItem = (
	overrides?: Partial<ReviewQueueItem>,
): ReviewQueueItem => ({ ...MOCK_REVIEW_QUEUE[0], ...overrides });

interface MakeReviewQueueOptions {
	items?: ReviewQueueItem[];
	total?: number;
	page?: number;
	pageSize?: number;
}

export const makeReviewQueue = ({
	items = MOCK_REVIEW_QUEUE,
	total = items.length,
	page = 1,
	pageSize = 10,
}: MakeReviewQueueOptions = {}): ReviewQueueListResponse => ({
	data: items,
	pagination: { total, page, pageSize },
});

export const makeReviewQueueIndicators = (
	items: ReviewQueueItem[] = MOCK_REVIEW_QUEUE,
): ReviewQueueIndicators => ({
	total: items.length,
	dueSoon: items.filter(({ deadlineStatus }) => deadlineStatus !== "ON_TIME")
		.length,
	highDemand: items.filter(({ demandKva }) => (demandKva ?? 0) > 50).length,
	reanalysis: items.filter(({ reanalysis }) => reanalysis).length,
	reviewedToday: 7,
	monthlyRejectionPercent: 21,
});

export const makeReviewQueueIndicatorsResponse = (
	items: ReviewQueueItem[] = MOCK_REVIEW_QUEUE,
): ReviewQueueIndicatorsResponse => ({
	data: makeReviewQueueIndicators(items),
});
