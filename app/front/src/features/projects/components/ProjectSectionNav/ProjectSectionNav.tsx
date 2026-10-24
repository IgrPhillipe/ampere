import { attentionSeverityClassNames } from "@components/AttentionIndicator";
import { cn } from "@lib/utils";
import { Link } from "@tanstack/react-router";
import { Check, TriangleAlert } from "lucide-react";

import { PROJECT_SECTIONS, type ProjectSectionKey } from "../../constants";

export interface ProjectSectionState {
	/** Ready for the submission; only shown while the project is edited. */
	done?: boolean;
	/** Changed after something that depends on it, such as an outdated calculation. */
	outdated?: boolean;
	/** Findings waiting on whoever is looking at the project. */
	attention?: number;
}

interface ProjectSectionNavProps {
	projectId: string;
	sections?: Partial<Record<ProjectSectionKey, ProjectSectionState>>;
	className?: string;
}

const SectionIndicator = ({
	done,
	outdated,
	attention,
}: ProjectSectionState) => {
	if (attention) {
		return (
			<span
				className={cn(
					"rounded-full px-1.5 font-mono text-xs",
					attentionSeverityClassNames.warning,
				)}
			>
				<span aria-hidden="true">{attention}</span>
				<span className="sr-only">
					{` (${attention} ${attention === 1 ? "apontamento" : "apontamentos"})`}
				</span>
			</span>
		);
	}

	if (outdated) {
		return (
			<>
				<TriangleAlert
					aria-hidden="true"
					className="size-3.5 text-warning-foreground"
				/>
				<span className="sr-only"> (desatualizado)</span>
			</>
		);
	}

	if (done) {
		return (
			<>
				<Check aria-hidden="true" className="size-3.5" />
				<span className="sr-only"> (concluído)</span>
			</>
		);
	}

	return null;
};

export const ProjectSectionNav = ({
	projectId,
	sections = {},
	className,
}: ProjectSectionNavProps) => (
	<nav
		aria-label="Seções do projeto"
		className={cn("border-b border-border px-6 md:px-8", className)}
	>
		<ul className="flex overflow-x-auto">
			{PROJECT_SECTIONS.map(({ key, label, to }) => (
				<li
					key={key}
					className="group/section relative flex text-sm whitespace-nowrap not-first:before:absolute not-first:before:top-1/2 not-first:before:left-0 not-first:before:h-5 not-first:before:w-px not-first:before:-translate-y-1/2 not-first:before:bg-border"
				>
					<Link
						to={to}
						params={{ id: projectId }}
						activeOptions={{ exact: true, includeHash: false }}
						className="-mb-px flex items-center gap-2 border-b-2 border-transparent px-3 py-3 text-muted-foreground transition-colors group-first/section:pl-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[status=active]:border-foreground data-[status=active]:font-medium data-[status=active]:text-foreground"
					>
						{label}
						<SectionIndicator {...sections[key]} />
					</Link>
				</li>
			))}
		</ul>
	</nav>
);
