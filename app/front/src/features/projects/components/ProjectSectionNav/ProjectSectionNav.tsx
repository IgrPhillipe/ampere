import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

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

const AttentionDot = () => (
	<span
		aria-hidden="true"
		className="size-1.5 shrink-0 rounded-full bg-attention"
	/>
);

const SectionIndicator = ({
	done,
	outdated,
	attention,
}: ProjectSectionState) => {
	if (attention) {
		return (
			<span className="flex items-center gap-1.5">
				<AttentionDot />
				<span
					aria-hidden="true"
					className="font-mono text-xs font-semibold text-foreground"
				>
					{padCount(attention)}
				</span>
				<span className="sr-only">
					{` (${attention} ${attention === 1 ? "apontamento" : "apontamentos"})`}
				</span>
			</span>
		);
	}

	if (outdated) {
		return (
			<>
				<AttentionDot />
				<span className="sr-only"> (desatualizado)</span>
			</>
		);
	}

	if (done) {
		return (
			<>
				<Check
					aria-hidden="true"
					className="size-3.5 shrink-0 text-faint-foreground group-data-[status=active]/step:text-foreground"
				/>
				<span className="sr-only"> (concluído)</span>
			</>
		);
	}

	return null;
};

/** The Figma's step strip: equal cells, a mono index and a 2px rule under the open one. */
export const ProjectSectionNav = ({
	projectId,
	sections = {},
	className,
}: ProjectSectionNavProps) => (
	<nav
		aria-label="Seções do projeto"
		className={cn("border-b border-border px-6 md:px-10", className)}
	>
		<ul className="flex overflow-x-auto">
			{PROJECT_SECTIONS.map(({ key, index, label, to }, position) => (
				<li
					key={key}
					className="relative flex min-w-max flex-1 basis-0 not-first:before:absolute not-first:before:top-1/2 not-first:before:left-0 not-first:before:h-5 not-first:before:w-px not-first:before:-translate-y-1/2 not-first:before:bg-border"
				>
					<Link
						to={to}
						params={{ id: projectId }}
						activeOptions={{ exact: true, includeHash: false }}
						title={sections[key]?.outdated ? "Desatualizado" : undefined}
						className={cn(
							"group/step -mb-px flex flex-1 items-center gap-2.5 border-b-2 border-transparent py-4 pr-5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset data-[status=active]:border-foreground data-[status=active]:text-foreground",
							position > 0 && "pl-5",
						)}
					>
						<span
							aria-hidden="true"
							className="font-mono text-2xs font-normal text-faint-foreground group-data-[status=active]/step:text-foreground"
						>
							{index}
						</span>
						{label}
						<SectionIndicator {...sections[key]} />
					</Link>
				</li>
			))}
		</ul>
	</nav>
);
