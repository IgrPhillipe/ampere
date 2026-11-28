import { formatDateTime } from "@features/shared";
import { cn } from "@lib/utils";
import type { MemorialVerification } from "@services/project-versions";
import { CircleCheck, CircleX } from "lucide-react";
import type { ReactNode } from "react";

import {
	DOCUMENT_TYPE_LABELS,
	REFUSAL_REASONS,
	SIGNATURE_LABELS,
} from "../../constants";

interface VerificationResultProps {
	result: MemorialVerification;
	className?: string;
}

const formatMoment = (value: string) => {
	const { date, time } = formatDateTime(value);

	return `${date} às ${time}`;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
	<>
		<dt className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
			{label}
		</dt>
		<dd className="font-mono">{children}</dd>
	</>
);

/** The memorial of a submission is issued at it, and the approval date says the rest. */
const showsIssue = ({
	issuedAt,
	submittedAt,
	approvedAt,
}: MemorialVerification) =>
	issuedAt !== null &&
	approvedAt === null &&
	(submittedAt === null ||
		new Date(issuedAt).getTime() !== new Date(submittedAt).getTime());

const NOT_RECOGNIZED =
	"O documento não corresponde a nenhum registro do AMPERE. Um arquivo alterado depois do download não passa na verificação; o código impresso continua levando ao documento original.";

/** The answer of the check: a registered document, or none. */
export const VerificationResult = ({
	result,
	className,
}: VerificationResultProps) => {
	if (!result.verified) {
		return (
			<section
				role="status"
				aria-labelledby="verificacao-resultado"
				className={cn(
					"flex flex-col gap-2 border-l-2 border-destructive bg-card px-5 py-4",
					className,
				)}
			>
				<h2
					id="verificacao-resultado"
					className="flex items-center gap-2 text-lg font-medium"
				>
					<CircleX aria-hidden="true" className="size-5 text-destructive" />
					Documento Não Reconhecido
				</h2>
				{result.signature && REFUSAL_REASONS[result.signature] ? (
					<p className="text-sm text-foreground">
						{REFUSAL_REASONS[result.signature]}
					</p>
				) : null}
				<p className="text-sm text-muted-foreground">{NOT_RECOGNIZED}</p>
			</section>
		);
	}

	const signature =
		result.signature === "VALID" || result.signature === "ABSENT"
			? SIGNATURE_LABELS[result.signature]
			: null;

	return (
		<section
			role="status"
			aria-labelledby="verificacao-resultado"
			className={cn(
				"flex flex-col gap-4 border-l-2 border-primary bg-card px-5 py-4",
				className,
			)}
		>
			<h2
				id="verificacao-resultado"
				className="flex items-center gap-2 text-lg font-medium"
			>
				<CircleCheck aria-hidden="true" className="size-5 text-primary" />
				Documento Autêntico
			</h2>
			<p className="text-sm text-muted-foreground">
				O documento corresponde a um registro do AMPERE, sem nenhuma alteração.
			</p>
			<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
				{result.documentType ? (
					<Field label="Documento">
						{DOCUMENT_TYPE_LABELS[result.documentType]}
					</Field>
				) : null}
				<Field label="Protocolo">{result.protocol}</Field>
				<Field label="Versão">
					{result.version ?? "Rascunho, não enviada"}
				</Field>
				{result.submittedAt ? (
					<Field label="Enviado em">{formatMoment(result.submittedAt)}</Field>
				) : null}
				{result.approvedAt ? (
					<Field label="Aprovado com ressalvas em">
						{formatMoment(result.approvedAt)}
					</Field>
				) : null}
				{showsIssue(result) && result.issuedAt ? (
					<Field label="Emitido em">{formatMoment(result.issuedAt)}</Field>
				) : null}
				{signature ? (
					<Field label="Assinatura digital">{signature}</Field>
				) : null}
			</dl>
		</section>
	);
};
