import { InfiniteFilterMenu } from "@components/InfiniteFilterMenu";
import { useDebouncedValue } from "@features/shared";
import { useGetProjectOwnerInfiniteList } from "@services/projects";
import { useMemo, useState } from "react";

const SEARCH_DEBOUNCE_MS = 350;

interface ProjectOwnerFilterProps {
	value: string | null;
	/** The selected designer's name, which may not be among the loaded owners. */
	selectedLabel?: string;
	onValueChange: (owner: string | null) => void;
	allLabel?: string;
	className?: string;
}

export const ProjectOwnerFilter = ({
	value,
	selectedLabel,
	onValueChange,
	allLabel = "Todos",
	className,
}: ProjectOwnerFilterProps) => {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
	const ownersQuery = useGetProjectOwnerInfiniteList({
		search: debouncedSearch,
	});
	const options = useMemo(
		() =>
			(ownersQuery.data?.pages ?? [])
				.flatMap(({ data }) => data)
				.map(({ id, name }) => ({ value: id, label: name })),
		[ownersQuery.data],
	);

	return (
		<InfiniteFilterMenu
			label="Projetista"
			allLabel={allLabel}
			searchPlaceholder="Buscar projetista"
			emptyMessage="Nenhum projetista encontrado."
			options={options}
			value={value}
			selectedLabel={selectedLabel}
			onValueChange={onValueChange}
			onSearchChange={setSearch}
			hasNextPage={ownersQuery.hasNextPage}
			isFetchingNextPage={ownersQuery.isFetchingNextPage}
			isLoading={ownersQuery.isPending}
			onLoadMore={() => void ownersQuery.fetchNextPage()}
			className={className}
		/>
	);
};
