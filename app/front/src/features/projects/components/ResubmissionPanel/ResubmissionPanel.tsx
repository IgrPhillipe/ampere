import { ControlledTextarea } from "@components/form";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { padCount, useZodForm } from "@features/shared";
import { cn } from "@lib/utils";
import { ArrowRight } from "lucide-react";

import { type ResubmissionValues, resubmissionSchema } from "../../schemas";

interface ResubmissionPanelProps {
	nextVersion: number;
	unansweredBlocking: number;
	canSubmit: boolean;
	isPending: boolean;
	onSubmit: (values: ResubmissionValues) => void;
	className?: string;
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
	className,
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
			className={cn("flex flex-col gap-5", className)}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<SectionHeading
				id="resubmission-title"
				meta={`v${padCount(nextVersion)}`}
			>
				Reenviar Projeto
			</SectionHeading>
			<p className="text-sm text-muted-foreground">
				O projeto volta à análise como Versão {nextVersion}, com o mesmo
				protocolo.
			</p>

			<ControlledTextarea
				control={form.control}
				name="changeSummary"
				label="Resumo das alterações"
				description="Descreva objetivamente o que foi corrigido ou contestado nesta versão."
				placeholder="Ex.: Substituí a ART assinada e corrigi a área do apartamento tipo B."
				maxLength={2000}
				required
			/>

			{alert ? (
				<p role="status" className="flex gap-2.5 text-sm text-foreground">
					<span
						aria-hidden="true"
						className="mt-1.5 size-1.5 shrink-0 rounded-full bg-attention"
					/>
					{alert}
				</p>
			) : null}

			<Button
				type="submit"
				className="w-full"
				disabled={!canSubmit || isPending}
			>
				{isPending ? "Reenviando..." : "Reenviar Projeto"}
				<ArrowRight aria-hidden="true" />
			</Button>
		</form>
	);
};
