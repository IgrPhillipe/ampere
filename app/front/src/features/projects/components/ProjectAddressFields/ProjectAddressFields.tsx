import { ControlledInput, ControlledSelect } from "@components/form";
import {
	useGetPostalCodeAddress,
	useGetStateList,
	useGetStateMunicipalityList,
} from "@services/locations";
import { useEffect } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import type { ProjectCreationFormValues } from "../../schemas";

interface ProjectAddressFieldsProps {
	form: UseFormReturn<ProjectCreationFormValues>;
}

export const ProjectAddressFields = ({ form }: ProjectAddressFieldsProps) => {
	const { control, getFieldState, getValues, setError, setValue } = form;
	const postalCode = useWatch({ control, name: "postalCode" }) ?? "";
	const state = useWatch({ control, name: "state" }) ?? null;
	const digits = postalCode.replace(/\D/g, "");

	const statesQuery = useGetStateList();
	const municipalitiesQuery = useGetStateMunicipalityList(state);
	const lookup = useGetPostalCodeAddress(digits);

	const stateItems = Object.fromEntries(
		(statesQuery.data ?? []).map(({ sigla, nome }) => [sigla, nome]),
	);
	const municipalityItems = Object.fromEntries(
		(municipalitiesQuery.data ?? []).map((name) => [name, name]),
	);

	// A loaded project already has its address; only a CEP the user typed fills the rest.
	useEffect(() => {
		if (lookup.data === undefined || !getFieldState("postalCode").isDirty) {
			return;
		}

		if (lookup.data === null) {
			setError("postalCode", {
				message: "CEP não encontrado. Escolha a UF e o município.",
			});
			return;
		}

		const { cep, uf, localidade, logradouro, bairro } = lookup.data;
		const options = { shouldDirty: true, shouldValidate: true };

		setValue("postalCode", cep, options);
		setValue("state", uf, options);
		setValue("municipality", localidade, options);

		if (!getValues("address").trim()) {
			setValue(
				"address",
				[logradouro, bairro].filter(Boolean).join(", "),
				options,
			);
		}
	}, [lookup.data, getFieldState, getValues, setError, setValue]);

	return (
		<>
			<ControlledInput
				control={control}
				name="postalCode"
				label="CEP"
				placeholder="00000-000"
				inputMode="numeric"
				autoComplete="postal-code"
				maxLength={9}
				description={
					lookup.isFetching ? "Buscando o endereço do CEP..." : undefined
				}
				required
				variant="underline"
			/>

			<ControlledSelect
				control={control}
				name="state"
				label="UF"
				placeholder="Selecione a UF"
				items={stateItems}
				disabled={statesQuery.isPending}
				required
				variant="underline"
			/>

			<ControlledSelect
				control={control}
				name="municipality"
				label="Município"
				placeholder={state ? "Selecione o município" : "Escolha a UF antes"}
				items={municipalityItems}
				disabled={!state || municipalitiesQuery.isPending}
				required
				variant="underline"
			/>

			<ControlledInput
				control={control}
				name="address"
				label="Endereço"
				placeholder="Rua, número e bairro"
				autoComplete="street-address"
				required
				variant="underline"
			/>
		</>
	);
};
