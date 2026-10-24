import {
	type Project,
	useGetProjectOwnerInfiniteList,
} from "@services/projects";

const SELECTED_OWNER_FALLBACK = "Projetista selecionado";

/** The designer's name from the loaded owners, else from the listed rows, else a neutral label. */
export const useSelectedOwnerName = (
	owner: string | null,
	projects: readonly Project[],
) => {
	const ownersQuery = useGetProjectOwnerInfiniteList({
		enabled: owner !== null,
	});

	if (owner === null) return undefined;

	return (
		ownersQuery.data?.pages
			.flatMap(({ data }) => data)
			.find(({ id }) => id === owner)?.name ??
		projects.find(({ ownerId }) => ownerId === owner)?.ownerName ??
		SELECTED_OWNER_FALLBACK
	);
};
