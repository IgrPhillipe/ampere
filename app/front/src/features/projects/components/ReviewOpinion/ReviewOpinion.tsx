import { formatDate } from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectDetail } from "@services/projects";
import { CircleCheck, CircleX } from "lucide-react";

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
	className?: string;
}

/** The analyst's decision, once there is one. */
export const ReviewOpinion = ({ project, className }: ReviewOpinionProps) => {
	if (!hasOpinion(project.status)) return null;

	const opinion = opinionStyles[project.status];

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
