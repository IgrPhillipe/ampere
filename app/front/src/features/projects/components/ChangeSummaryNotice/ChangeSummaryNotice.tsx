import { cn } from "@lib/utils";

interface ChangeSummaryNoticeProps {
	version: number;
	summary: string;
	className?: string;
}

export const ChangeSummaryNotice = ({
	version,
	summary,
	className,
}: ChangeSummaryNoticeProps) => (
	<section
		aria-labelledby="change-summary-title"
		className={cn(
			"border-b border-border bg-accent px-6 py-4 md:px-8",
			className,
		)}
	>
		<p
			id="change-summary-title"
			className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase"
		>
			Resumo das Alterações da Versão {version}
		</p>
		<p className="mt-2 text-sm whitespace-pre-line text-foreground">
			{summary}
		</p>
	</section>
);
