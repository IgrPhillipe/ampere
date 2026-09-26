import { Skeleton } from "@components/ui/skeleton";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { ProjectDetail } from "@services/projects";
import type { ReactNode } from "react";

interface ProjectStampProps {
	project?: ProjectDetail;
	/** "55 em 5 grupos". Fica com a tela, que e quem sabe contar as unidades. */
	units?: ReactNode;
	className?: string;
}

interface StampCellProps {
	label: string;
	children?: ReactNode;
}

const StampCell = ({ label, children }: StampCellProps) => (
	<div className="flex flex-col gap-1.5 px-6 py-4 not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l border-border md:px-8">
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		<dd className="font-mono text-sm text-foreground">
			{children ?? <Skeleton className="h-5 w-32" />}
		</dd>
	</div>
);

/**
 * O carimbo do projeto: norma, responsavel tecnico, unidades e emissao, no
 * topo das etapas depois da primeira.
 *
 * O responsavel tecnico e a ART anexada no envio (US05); ate la o campo fica
 * com o traco, e nao some, para a tela nao mudar de forma quando ele chegar.
 */
export const ProjectStamp = ({
	project,
	units,
	className,
}: ProjectStampProps) => (
	<dl
		className={cn(
			"grid border-b border-border bg-card sm:grid-cols-2 lg:grid-cols-4",
			className,
		)}
	>
		<StampCell label="Norma aplicada">
			{project
				? project.standards
						.map(({ name, revision }) => `${name} ${revision}`)
						.join(" · ")
				: undefined}
		</StampCell>

		<StampCell label="Responsável técnico">
			{project ? "—" : undefined}
		</StampCell>

		<StampCell label="Unidades">{units}</StampCell>

		<StampCell label="Emissão">
			{project ? (
				<time dateTime={project.createdAt}>
					{dayjs(project.createdAt).format("DD.MM.YYYY")}
				</time>
			) : undefined}
		</StampCell>
	</dl>
);
