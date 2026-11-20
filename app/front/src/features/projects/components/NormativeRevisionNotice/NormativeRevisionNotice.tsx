interface NormativeRevisionNoticeProps {
	fixedAt?: string | null;
}

export const NormativeRevisionNotice = ({
	fixedAt,
}: NormativeRevisionNoticeProps) =>
	fixedAt ? (
		<p
			role="status"
			className="mx-6 mt-5 text-sm text-muted-foreground md:mx-10"
		>
			As revisões normativas são as vigentes no primeiro envio do protocolo, em{" "}
			{new Date(fixedAt).toLocaleDateString("pt-BR")}.
		</p>
	) : null;
