import { formatDate, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";
import type { ProjectDetail } from "@services/projects";
import { CircleCheck, CircleX } from "lucide-react";

import type { FindingReferenceOptions } from "../../constants";
import { ReservationList } from "../ReservationList";

const opinionStyles = {
	REJECTED: {
		title: "Parecer da Reprovação",
		icon: CircleX,
		className: "border-l-destructive bg-destructive/5",
		iconClassName: "text-destructive",
	},
	APPROVED: {
		title: "Parecer da Aprovação",
		icon: CircleCheck,
		className: "border-l-success bg-success/10",
		iconClassName: "text-success",
	},
} as const;

const hasOpinion = (
	status: ProjectDetail["status"],
): status is keyof typeof opinionStyles => status in opinionStyles;

interface ReviewOpinionProps {
	project: Pick<
		ProjectDetail,
		"status" | "reviewOpinion" | "reviewerName" | "reviewedAt"
	>;
	/** Adjustments left unresolved by the approval. */
	reservations?: Finding[];
	referenceOptions: FindingReferenceOptions;
	className?: string;
}

/** The analyst's decision, once there is one. */
export const ReviewOpinion = ({
	project,
	reservations = [],
	referenceOptions,
	className,
}: ReviewOpinionProps) => {
	if (!hasOpinion(project.status)) return null;

	const opinion = opinionStyles[project.status];
	const showReservations =
		project.status === "APPROVED" && reservations.length > 0;

	return (
		<section
			aria-labelledby="review-opinion-title"
			className={cn(
				"flex flex-col gap-3 overflow-hidden rounded-xs border border-l-4 border-border px-5 py-5",
				opinion.className,
				className,
			)}
		>
			<h2
				id="review-opinion-title"
				className="flex items-center gap-2 text-lg font-semibold text-foreground"
			>
				<opinion.icon
					aria-hidden="true"
					className={cn("size-5 shrink-0", opinion.iconClassName)}
				/>
				{opinion.title}
			</h2>
			<p className="text-base leading-relaxed whitespace-pre-line text-foreground">
				{project.reviewOpinion || "O analista não registrou um parecer geral."}
			</p>
			{showReservations ? (
				<div
					aria-labelledby="review-reservations-title"
					role="group"
					className="flex flex-col gap-1 border-t border-border pt-4"
				>
					<h3
						id="review-reservations-title"
						className="flex items-baseline gap-2 text-base font-semibold text-foreground"
					>
						Ressalvas
						<span className="font-mono text-sm font-normal text-muted-foreground">
							{padCount(reservations.length)}
						</span>
					</h3>
					<p className="text-sm text-muted-foreground">
						Ajustes que o projeto aprovado mantém, sem nova análise.
					</p>
					<ReservationList
						reservations={reservations}
						referenceOptions={referenceOptions}
					/>
				</div>
			) : null}
			<dl className="-mx-5 -mb-5 mt-2 grid grid-cols-2 gap-px border-t border-border bg-border">
				<div className="flex min-w-0 flex-col gap-1.5 bg-card px-5 py-3">
					<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
						Analista
					</dt>
					<dd className="text-sm font-medium break-words text-foreground">
						{project.reviewerName ?? "Não informado"}
					</dd>
				</div>
				<div className="flex min-w-0 flex-col gap-1.5 bg-card px-5 py-3">
					<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
						Decidido em
					</dt>
					<dd className="font-mono text-sm text-foreground">
						{project.reviewedAt ? (
							<time dateTime={project.reviewedAt}>
								{formatDate(project.reviewedAt)}
							</time>
						) : (
							"Não informado"
						)}
					</dd>
				</div>
			</dl>
		</section>
	);
};
