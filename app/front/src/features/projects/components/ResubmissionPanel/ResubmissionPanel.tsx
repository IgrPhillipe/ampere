import { ControlledTextarea } from "@components/form";
import { Button } from "@components/ui/button";
import { useZodForm } from "@features/shared";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { type ResubmissionValues, resubmissionSchema } from "../../schemas";

interface ResubmissionPanelProps {
	unansweredBlocking: number;
	canSubmit: boolean;
	isPending: boolean;
	onSubmit: (values: ResubmissionValues) => void;
}

export const ResubmissionPanel = ({
	unansweredBlocking,
	canSubmit,
	isPending,
	onSubmit,
}: ResubmissionPanelProps) => {
	const form = useZodForm(resubmissionSchema, { changeSummary: "" });
	const blocked = unansweredBlocking > 0;

	return (
		<form
			noValidate
			className="border-t border-border bg-surface-hover px-6 py-6 md:px-8"
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<div className="flex items-center gap-2">
				<RotateCcw aria-hidden="true" className="size-4 text-primary" />
				<h2 className="text-base font-semibold">Reenviar projeto</h2>
			</div>

			{blocked ? (
				<p
					role="status"
					className="mt-4 flex gap-2 border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
				>
					<TriangleAlert
						aria-hidden="true"
						className="mt-0.5 size-4 shrink-0"
					/>
					Responda {unansweredBlocking}{" "}
					{unansweredBlocking === 1
						? "apontamento bloqueante"
						: "apontamentos bloqueantes"}{" "}
					antes de reenviar.
				</p>
			) : null}

			<ControlledTextarea
				control={form.control}
				name="changeSummary"
				label="Resumo das alterações"
				description="Descreva objetivamente o que foi corrigido ou contestado nesta versão."
				placeholder="Ex.: Substituí a ART assinada e corrigi a área do apartamento tipo B."
				maxLength={2000}
				required
				fieldClassName="mt-5"
			/>

			<Button
				type="submit"
				className="mt-5 w-full"
				disabled={!canSubmit || blocked || isPending}
			>
				{isPending ? "Reenviando..." : "Reenviar Projeto"}
			</Button>
		</form>
	);
};
