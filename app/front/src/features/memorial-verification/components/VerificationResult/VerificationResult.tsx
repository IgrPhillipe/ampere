import { formatDateTime } from "@features/shared";
import { cn } from "@lib/utils";
import type { MemorialVerification } from "@services/project-versions";
import { CircleCheck, CircleX } from "lucide-react";

interface VerificationResultProps {
	result: MemorialVerification;
	className?: string;
}

const formatMoment = (value: string) => {
	const { date, time } = formatDateTime(value);

	return `${date} às ${time}`;
};

/** The answer of the check: a registered version, or none. */
export const VerificationResult = ({
	result,
	className,
}: VerificationResultProps) =>
	result.verified ? (
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
				Memorial autêntico
			</h2>
			<p className="text-sm text-muted-foreground">
				O documento corresponde a uma versão registrada no envio, sem nenhuma
				alteração.
			</p>
			<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
				<dt className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
					Protocolo
				</dt>
				<dd className="font-mono">{result.protocol}</dd>
				<dt className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
					Versão
				</dt>
				<dd className="font-mono">{result.version}</dd>
				{result.submittedAt ? (
					<>
						<dt className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
							Enviado em
						</dt>
						<dd className="font-mono">{formatMoment(result.submittedAt)}</dd>
					</>
				) : null}
				{result.approvedAt ? (
					<>
						<dt className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
							Aprovado com ressalvas em
						</dt>
						<dd className="font-mono">{formatMoment(result.approvedAt)}</dd>
					</>
				) : null}
			</dl>
		</section>
	) : (
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
				Documento não reconhecido
			</h2>
			<p className="text-sm text-muted-foreground">
				O documento não corresponde a nenhuma versão registrada. Um memorial
				alterado depois do download não passa na verificação; o código do rodapé
				continua levando à versão original.
			</p>
		</section>
	);
