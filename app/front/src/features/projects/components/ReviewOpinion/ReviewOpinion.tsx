import { formatDate } from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectDetail } from "@services/projects";

const opinionTitles = {
	REJECTED: "Parecer da Reprovação",
	APPROVED: "Parecer da Aprovação",
} as const;

const hasOpinion = (
	status: ProjectDetail["status"],
): status is keyof typeof opinionTitles => status in opinionTitles;

interface ReviewOpinionProps {
	project: Pick<
		ProjectDetail,
		"status" | "reviewOpinion" | "reviewerName" | "reviewedAt"
	>;
	className?: string;
}

/** The analyst's decision, once there is one: ink text on a 2px ink bar. */
export const ReviewOpinion = ({ project, className }: ReviewOpinionProps) => {
	if (!hasOpinion(project.status)) return null;

	return (
		<section
			aria-labelledby="review-opinion-title"
			className={cn(
				"flex flex-col gap-3 border-l-2 border-foreground py-1 pl-5",
				className,
			)}
		>
			<h2
				id="review-opinion-title"
				className="font-mono text-2xs tracking-[0.11em] text-foreground uppercase"
			>
				{opinionTitles[project.status]}
			</h2>
			<p className="max-w-3xl text-base leading-relaxed whitespace-pre-line text-foreground">
				{project.reviewOpinion || "O analista não registrou um parecer geral."}
			</p>
			<p className="text-sm text-faint-foreground">
				Decidido por{" "}
				<span className="text-muted-foreground">
					{project.reviewerName ?? "analista não informado"}
				</span>
				{project.reviewedAt ? (
					<>
						{" em "}
						<time
							dateTime={project.reviewedAt}
							className="font-mono text-muted-foreground"
						>
							{formatDate(project.reviewedAt)}
						</time>
					</>
				) : null}
			</p>
		</section>
	);
};
