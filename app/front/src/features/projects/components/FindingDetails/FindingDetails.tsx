import { ExpandableText } from "@components/ExpandableText";
import { Badge } from "@components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { formatDateTime } from "@features/shared";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";
import type { ReactNode } from "react";

import {
	findingSeverityBadgeVariants,
	findingSeverityLabels,
	findingStageLabels,
	findingStatusBadgeVariants,
	findingStatusLabels,
} from "../../constants";

interface MetaItemProps {
	label: string;
	person?: string;
	at?: string | null;
	value?: string;
}

/** Same reading as the normative tables metadata: who, then when, under a mono label. */
const MetaItem = ({ label, person, at, value }: MetaItemProps) => (
	<div className="flex min-w-0 flex-col gap-1.5">
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		<dd className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
			{person ? (
				<span className="truncate text-sm font-medium text-foreground">
					{person}
				</span>
			) : null}
			{value ? <span className="text-sm text-foreground">{value}</span> : null}
			{at ? (
				<time dateTime={at} className="font-mono text-xs text-muted-foreground">
					{formatDateTime(at)}
				</time>
			) : null}
		</dd>
	</div>
);

interface FindingSummaryProps {
	finding: Finding;
	reference: string | null;
	/** A draft has no submission yet. */
	showVersion?: boolean;
	descriptionId?: string;
}

/** Badges, then what to fix, then who asked, when and in which submission. */
export const FindingSummary = ({
	finding,
	reference,
	showVersion = true,
	descriptionId,
}: FindingSummaryProps) => (
	<>
		<div className="flex flex-wrap items-center gap-2">
			<Badge variant={findingSeverityBadgeVariants[finding.severity]}>
				{findingSeverityLabels[finding.severity]}
			</Badge>
			<Badge variant={findingStatusBadgeVariants[finding.status]}>
				{findingStatusLabels[finding.status]}
			</Badge>
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

		<dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
			<MetaItem
				label="Registro"
				person={finding.authorName ?? "Analista não informado"}
				at={finding.createdAt}
			/>
			{showVersion ? (
				<MetaItem label="Envio" value={`${finding.version}º envio`} />
			) : null}
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
				<h4 className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
					{title}
				</h4>
				{respondedAt ? (
					<time
						dateTime={respondedAt}
						className="font-mono text-xs text-muted-foreground"
					>
						{formatDateTime(respondedAt)}
					</time>
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

interface FindingRowProps {
	finding: Finding;
	reference: string | null;
	/** A draft has no submission yet. */
	showVersion?: boolean;
	isSelected?: boolean;
	onOpen: (finding: Finding) => void;
}

/** One line per finding in a list; the details and the actions open in a dialog. */
export const FindingRow = ({
	finding,
	reference,
	showVersion = true,
	isSelected = false,
	onOpen,
}: FindingRowProps) => (
	<li className="border-b border-border last:border-b-0">
		<button
			type="button"
			onClick={() => onOpen(finding)}
			className={cn(
				"-mx-3 flex w-[calc(100%+1.5rem)] flex-col gap-2 rounded-xs px-3 py-4 text-left transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
				isSelected && "bg-surface-hover",
			)}
		>
			<span className="flex w-full items-start justify-between gap-3">
				<span className="flex flex-wrap items-center gap-2">
					<Badge variant={findingSeverityBadgeVariants[finding.severity]}>
						{findingSeverityLabels[finding.severity]}
					</Badge>
					<Badge variant={findingStatusBadgeVariants[finding.status]}>
						{findingStatusLabels[finding.status]}
					</Badge>
				</span>
				{showVersion ? (
					<span className="shrink-0 pt-1 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
						{finding.version}º envio
					</span>
				) : null}
			</span>
			<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
				{findingStageLabels[finding.stage]}
				{reference ? `: ${reference}` : null}
			</span>
			<span className="line-clamp-2 text-sm font-medium text-foreground">
				{finding.description}
			</span>
			<span className="text-xs font-medium text-foreground underline decoration-current/40 underline-offset-4">
				Ver Detalhes
			</span>
		</button>
	</li>
);

interface FindingDialogProps {
	finding: Finding | undefined;
	reference: string | null;
	onClose: () => void;
	children: ReactNode;
}

export const FindingDialog = ({
	finding,
	reference,
	onClose,
	children,
}: FindingDialogProps) => (
	<Dialog
		open={finding !== undefined}
		onOpenChange={(open) => {
			if (!open) onClose();
		}}
	>
		<DialogContent className="max-h-[85vh] gap-0 overflow-y-auto bg-card p-0 sm:max-w-xl">
			<DialogHeader className="border-b border-border px-6 py-5 pr-12 text-left">
				<DialogTitle className="font-heading text-lg">Apontamento</DialogTitle>
				<DialogDescription>
					{finding
						? `${findingStageLabels[finding.stage]}${reference ? `: ${reference}` : ""}`
						: null}
				</DialogDescription>
			</DialogHeader>
			<div className="px-6 py-5">{children}</div>
		</DialogContent>
	</Dialog>
);
