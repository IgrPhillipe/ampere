import { ControlledTextarea } from "@components/form";
import { Button } from "@components/ui/button";
import { useZodForm } from "@features/shared";
import { useEffect } from "react";

import {
	type FindingResponseValues,
	findingResponseSchema,
} from "../../schemas";

interface FindingResponseFormProps {
	id?: string;
	status: FindingResponseValues["status"];
	initialResponse?: string | null;
	isPending: boolean;
	onSubmit: (values: FindingResponseValues) => void;
	onCancel: () => void;
}

export const FindingResponseForm = ({
	id,
	status,
	initialResponse,
	isPending,
	onSubmit,
	onCancel,
}: FindingResponseFormProps) => {
	const form = useZodForm(findingResponseSchema, {
		status,
		response: initialResponse ?? "",
	});

	useEffect(() => {
		form.reset({ status, response: initialResponse ?? "" });
		form.setFocus("response");
	}, [form, initialResponse, status]);

	return (
		<form
			id={id}
			noValidate
			aria-label={
				status === "FIXED" ? "Confirmar correção" : "Contestar apontamento"
			}
			className="space-y-4 border-l-2 border-primary bg-background p-4"
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<ControlledTextarea
				control={form.control}
				name="response"
				label={status === "FIXED" ? "Observação" : "Justificativa"}
				description={
					status === "FIXED"
						? "Opcional. Informe onde a correção foi realizada."
						: "Explique por que o item já está adequado."
				}
				placeholder={
					status === "FIXED"
						? "Ex.: Substituí a ART na etapa de documentos."
						: "Informe a justificativa da contestação."
				}
				maxLength={2000}
				required={status === "CONTESTED"}
			/>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancelar
				</Button>
				<Button type="submit" disabled={isPending}>
					{status === "FIXED" ? "Confirmar Correção" : "Enviar Contestação"}
				</Button>
			</div>
		</form>
	);
};
