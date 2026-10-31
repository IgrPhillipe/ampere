import { FormField } from "@components/form";
import { InfiniteFilterMenu } from "@components/InfiniteFilterMenu";
import { useGetDesignerInfiniteList } from "@services/users";
import { useState } from "react";
import { type Control, Controller } from "react-hook-form";

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
		<Controller
			control={control}
			name="ownerId"
			render={({ field, fieldState }) => (
				<FormField
					label="Projetista"
					required={!disabled}
					error={fieldState.error?.message}
				>
					<InfiniteFilterMenu
						label="Projetista"
						allLabel="Selecione o projetista"
						clearLabel="Limpar seleção"
						searchPlaceholder="Buscar projetista"
						emptyMessage="Nenhum projetista ativo encontrado."
						options={designers}
						value={field.value ? field.value : null}
						selectedLabel={ownerName ?? undefined}
						onValueChange={(next) => field.onChange(next ?? undefined)}
						onSearchChange={setSearch}
						hasNextPage={designersQuery.hasNextPage}
						isFetchingNextPage={designersQuery.isFetchingNextPage}
						isLoading={designersQuery.isPending}
						onLoadMore={() => void designersQuery.fetchNextPage()}
						disabled={disabled}
						className="w-full"
					/>
				</FormField>
			)}
		/>
	);
};
