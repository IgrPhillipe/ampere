import {
	type ReviewQueueItem,
	useGetQueueOwnerInfiniteList,
} from "@services/review-queue";

const SELECTED_OWNER_FALLBACK = "Projetista selecionado";

/**
 * The designer's name from the loaded owners, else from the listed rows, else a neutral label.
 * The rows come filtered by the owner, so any of them names it.
 */
export const useSelectedOwnerName = (
	owner: string | null,
	items: readonly ReviewQueueItem[],
) => {
	const ownersQuery = useGetQueueOwnerInfiniteList({
		enabled: owner !== null,
	});

	if (owner === null) return undefined;

	return (
		ownersQuery.data?.pages
			.flatMap(({ data }) => data)
			.find(({ id }) => id === owner)?.name ??
		items[0]?.ownerName ??
		SELECTED_OWNER_FALLBACK
	);
};
