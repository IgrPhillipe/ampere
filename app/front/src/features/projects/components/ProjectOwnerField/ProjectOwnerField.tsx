import { ControlledInfiniteCombobox } from "@components/form";
import { useGetDesignerInfiniteList } from "@services/users";
import { useState } from "react";
import type { Control } from "react-hook-form";

import type { ProjectCreationFormValues } from "../../schemas";

interface ProjectOwnerFieldProps {
	control: Control<ProjectCreationFormValues>;
	/** The owner never changes after the project exists; the field then only shows who it is. */
	disabled?: boolean;
	/** The owner's name, which may not be among the loaded designers. */
	ownerName?: string | null;
}

/** The administrator creates the project in the name of an active designer. */
export const ProjectOwnerField = ({
	control,
	disabled = false,
	ownerName,
}: ProjectOwnerFieldProps) => {
	const [search, setSearch] = useState("");
	const designersQuery = useGetDesignerInfiniteList({
		search,
		enabled: !disabled,
	});
	const designers = (designersQuery.data?.pages ?? [])
		.flatMap(({ data }) => data)
		.map(({ id, name }) => ({ value: id, label: name }));

	return (
		<ControlledInfiniteCombobox
			control={control}
			name="ownerId"
			label="Projetista"
			placeholder="Selecione o projetista"
			searchPlaceholder="Buscar projetista"
			emptyMessage="Nenhum projetista ativo encontrado."
			required={!disabled}
			disabled={disabled}
			options={designers}
			selectedLabel={ownerName ?? undefined}
			onSearchChange={setSearch}
			hasNextPage={designersQuery.hasNextPage}
			isFetchingNextPage={designersQuery.isFetchingNextPage}
			isLoading={designersQuery.isPending}
			onLoadMore={designersQuery.fetchNextPage}
		/>
	);
};
