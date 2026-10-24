import { attentionSeverityClassNames } from "@components/AttentionIndicator";
import { ControlledTextarea } from "@components/form";
import { Button } from "@components/ui/button";
import { useZodForm } from "@features/shared";
import { cn } from "@lib/utils";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { type ResubmissionValues, resubmissionSchema } from "../../schemas";

interface ResubmissionPanelProps {
	nextVersion: number;
	unansweredBlocking: number;
	canSubmit: boolean;
	isPending: boolean;
	onSubmit: (values: ResubmissionValues) => void;
}

const blockingMessage = (count: number) =>
	`Responda ${count} ${
		count === 1 ? "apontamento bloqueante" : "apontamentos bloqueantes"
	} antes de reenviar.`;

export const ResubmissionPanel = ({
	nextVersion,
	unansweredBlocking,
	canSubmit,
	isPending,
	onSubmit,
}: ResubmissionPanelProps) => {
	const form = useZodForm(resubmissionSchema, { changeSummary: "" });
	const alert =
		unansweredBlocking > 0
			? blockingMessage(unansweredBlocking)
			: canSubmit
				? null
				: "Conclua o cálculo e os documentos do memorial antes de reenviar.";

	return (
		<form
			noValidate
			aria-labelledby="resubmission-title"
			className="border-t border-border p-5"
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<div className="flex items-center gap-2">
				<RotateCcw aria-hidden="true" className="size-4 text-primary" />
				<h2 id="resubmission-title" className="text-base font-semibold">
					Reenviar Projeto
				</h2>
			</div>
			<p className="mt-2 text-sm text-muted-foreground">
				O projeto volta à análise como Versão {nextVersion}.
			</p>

			{alert ? (
				<p
					role="status"
					className={cn(
						"mt-4 flex gap-2 rounded-xs p-3 text-sm",
						attentionSeverityClassNames.critical,
					)}
				>
					<TriangleAlert
						aria-hidden="true"
						className="mt-0.5 size-4 shrink-0"
					/>
					{alert}
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
				disabled={!canSubmit || isPending}
			>
				{isPending ? "Reenviando..." : "Reenviar Projeto"}
			</Button>
		</form>
	);
};
