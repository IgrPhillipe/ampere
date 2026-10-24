import { ExpandableText } from "@components/ExpandableText";
import { Badge } from "@components/ui/badge";
import { formatDate } from "@features/shared";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";

import {
	findingSeverityBadgeVariants,
	findingSeverityLabels,
	findingStageLabels,
	findingStatusBadgeVariants,
	findingStatusLabels,
} from "../../constants";

interface FindingSummaryProps {
	finding: Finding;
	reference: string | null;
	/** A draft has no submission yet. */
	showVersion?: boolean;
	descriptionId?: string;
}

/** Badges and submission on one line, then what to fix, then who asked and when. */
export const FindingSummary = ({
	finding,
	reference,
	showVersion = true,
	descriptionId,
}: FindingSummaryProps) => (
	<>
		<div className="flex items-start justify-between gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Badge variant={findingSeverityBadgeVariants[finding.severity]}>
					{findingSeverityLabels[finding.severity]}
				</Badge>
				<Badge variant={findingStatusBadgeVariants[finding.status]}>
					{findingStatusLabels[finding.status]}
				</Badge>
			</div>
			{showVersion ? (
				<span className="shrink-0 pt-1 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
					{finding.version}º envio
				</span>
			) : null}
		</div>

		<div className="flex flex-col gap-1.5">
			<p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
				{findingStageLabels[finding.stage]}
				{reference ? `: ${reference}` : null}
			</p>
			<p
				id={descriptionId}
				className="text-base leading-snug font-medium break-words whitespace-pre-line text-foreground"
			>
				{finding.description}
			</p>
			{finding.standardItem ? (
				<p className="text-xs text-muted-foreground">
					Item da norma{" "}
					<span className="font-mono text-foreground">
						{finding.standardItem}
					</span>
				</p>
			) : null}
		</div>

		<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
			<div className="flex gap-1.5">
				<dt className="text-muted-foreground">Analista</dt>
				<dd className="text-foreground">
					{finding.authorName ?? "Não informado"}
				</dd>
			</div>
			<div className="flex gap-1.5">
				<dt className="text-muted-foreground">Registrado em</dt>
				<dd className="text-foreground">
					<time dateTime={finding.createdAt}>
						{formatDate(finding.createdAt)}
					</time>
				</dd>
			</div>
		</dl>
	</>
);

interface FindingAnswerProps {
	title: string;
	/** What the designer wrote; the fallback explains an answer without text. */
	text?: string | null;
	fallback?: string;
	respondedAt?: string | null;
	className?: string;
}

export const FindingAnswer = ({
	title,
	text,
	fallback,
	respondedAt,
	className,
}: FindingAnswerProps) => {
	const content = text || fallback;
	if (!content) return null;

	return (
		<section
			className={cn(
				"flex flex-col gap-2 rounded-xs bg-muted px-4 py-3",
				className,
			)}
		>
			<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
				<h4 className="font-sans text-xs font-semibold text-foreground">
					{title}
				</h4>
				{respondedAt ? (
					<span className="text-xs text-muted-foreground">
						Respondido em{" "}
						<time dateTime={respondedAt}>{formatDate(respondedAt)}</time>
					</span>
				) : null}
			</div>
			{text ? (
				<ExpandableText text={text} />
			) : (
				<p className="text-sm text-muted-foreground">{fallback}</p>
			)}
		</section>
	);
};
