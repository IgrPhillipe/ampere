import {
	ControlledCombobox,
	ControlledInput,
	ControlledSelect,
} from "@components/form";
import { formatPostalCode } from "@features/shared";
import {
	concessionMunicipalityByCode,
	concessionMunicipalityNames,
	concessionStateNames,
	useGetPostalCodeAddress,
} from "@services/locations";
import { useEffect } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import type { ProjectCreationFormValues } from "../../schemas";

interface ProjectAddressFieldsProps {
	form: UseFormReturn<ProjectCreationFormValues>;
}

const lookupHint = ({
	isFetching,
	isError,
	data,
}: ReturnType<typeof useGetPostalCodeAddress>) => {
	if (isFetching) return "Buscando o endereço do CEP...";
	if (isError)
		return "Não foi possível buscar o CEP. Escolha a UF e o município.";
	if (data === null) return "CEP não encontrado. Escolha a UF e o município.";
	return undefined;
};

export const ProjectAddressFields = ({ form }: ProjectAddressFieldsProps) => {
	const { control, getFieldState, setValue, trigger } = form;
	const postalCode = useWatch({ control, name: "postalCode" }) ?? "";
	const state = useWatch({ control, name: "state" }) ?? null;
	const digits = postalCode.replace(/\D/g, "");

	const lookup = useGetPostalCodeAddress(digits);
	const found = lookup.data
		? concessionMunicipalityByCode(lookup.data.ibge)
		: undefined;

	// A loaded project already has its address; only a CEP the user typed fills the rest.
	useEffect(() => {
		if (lookup.data === undefined || !getFieldState("postalCode").isDirty) {
			return;
		}

		const options = { shouldDirty: true };

		if (!found || !lookup.data) {
			setValue("state", undefined as never, options);
			setValue("municipality", "", options);
			setValue("address", "", options);
			void trigger("postalCode");
			return;
		}

		const { logradouro, bairro } = lookup.data;
		const street = [logradouro, bairro].filter(Boolean).join(", ");

		setValue("state", found.state, options);
		setValue("municipality", found.name, options);
		// A CEP for a whole municipality has no street; keep what the user typed.
		if (street) setValue("address", street, options);
		void trigger(["postalCode", "state", "municipality", "address"]);
	}, [lookup.data, found, getFieldState, setValue, trigger]);

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
				format={formatPostalCode}
				description={lookupHint(lookup)}
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
				options={concessionMunicipalityNames(state ? [state] : [])}
				disabled={!state}
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
