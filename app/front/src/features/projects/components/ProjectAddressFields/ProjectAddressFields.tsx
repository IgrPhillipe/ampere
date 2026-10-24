import {
	ControlledCombobox,
	ControlledInput,
	ControlledSelect,
} from "@components/form";
import {
	concessionStateNames,
	coversAddress,
	isConcessionState,
	OUTSIDE_CONCESSION_MESSAGE,
	useGetConcessionMunicipalityList,
	useGetPostalCodeAddress,
} from "@services/locations";
import { useEffect } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import type { ProjectCreationFormValues } from "../../schemas";

interface ProjectAddressFieldsProps {
	form: UseFormReturn<ProjectCreationFormValues>;
}

export const ProjectAddressFields = ({ form }: ProjectAddressFieldsProps) => {
	const { control, getFieldState, setError, setValue } = form;
	const postalCode = useWatch({ control, name: "postalCode" }) ?? "";
	const state = useWatch({ control, name: "state" }) ?? null;
	const digits = postalCode.replace(/\D/g, "");

	const municipalities = useGetConcessionMunicipalityList(state ? [state] : []);
	const lookup = useGetPostalCodeAddress(digits);

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

		if (!isConcessionState(uf) || !coversAddress(uf, localidade)) {
			setError("postalCode", { message: OUTSIDE_CONCESSION_MESSAGE });
			return;
		}

		const options = { shouldDirty: true, shouldValidate: true };

		setValue("postalCode", cep, options);
		setValue("state", uf, options);
		setValue("municipality", localidade, options);

		const street = [logradouro, bairro].filter(Boolean).join(", ");

		// A CEP for a whole municipality has no street; keep what the user typed.
		if (street) setValue("address", street, options);
	}, [lookup.data, getFieldState, setError, setValue]);

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
				items={concessionStateNames}
				required
				variant="underline"
			/>

			<ControlledCombobox
				control={control}
				name="municipality"
				label="Município"
				placeholder={state ? "Selecione o município" : "Escolha a UF antes"}
				searchPlaceholder="Buscar município"
				emptyMessage="Nenhum município encontrado."
				options={municipalities.municipalities}
				disabled={!state || municipalities.isPending}
				required
				variant="underline"
			/>

			<ControlledInput
				control={control}
				name="address"
				label="Endereço"
				placeholder="Rua, número e bairro"
				description="Preenchido pelo CEP; acrescente o número."
				autoComplete="street-address"
				required
				variant="underline"
			/>
		</>
	);
};
