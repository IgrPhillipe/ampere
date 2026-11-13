import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { formatPlace, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ConcessionMunicipality } from "@services/locations";
import { useState } from "react";

/** Enough to show the gap without pushing the analysts off the screen. */
const PREVIEW_SIZE = 24;

interface UnassignedMunicipalitiesProps {
	municipalities: readonly ConcessionMunicipality[];
	className?: string;
}

/** Concession municipalities without an analyst: their projects wait in the queue. */
export const UnassignedMunicipalities = ({
	municipalities,
	className,
}: UnassignedMunicipalitiesProps) => {
	const [expanded, setExpanded] = useState(false);
	const sorted = [...municipalities].sort((a, b) =>
		a.name.localeCompare(b.name, "pt-BR"),
	);
	const visible = expanded ? sorted : sorted.slice(0, PREVIEW_SIZE);
	const hidden = sorted.length - visible.length;

	return (
		<section
			aria-labelledby="unassigned-municipalities"
			className={cn("flex flex-col gap-4", className)}
		>
			<SectionHeading
				id="unassigned-municipalities"
				meta={`${padCount(municipalities.length)} sem analista`}
			>
				Municípios sem Analista
			</SectionHeading>

			{municipalities.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Todos os municípios da área de concessão têm um analista.
				</p>
			) : (
				<div className="relative flex flex-col gap-3 pl-4">
					<span
						aria-hidden="true"
						className="absolute inset-y-0 left-0 w-0.5 bg-attention"
					/>
					<p className="text-sm text-foreground">
						Os projetos enviados destes municípios ficam "Não Atribuído" na fila
						até o gestor atribuir.
					</p>
					<ul
						aria-label="Municípios da área de concessão sem analista"
						className="flex flex-wrap gap-2"
					>
						{visible.map(({ code, name, state }) => (
							<li
								key={code}
								className="border border-border px-2 py-1 text-sm text-foreground"
							>
								{formatPlace(name, state)}
							</li>
						))}
					</ul>
					{hidden > 0 || expanded ? (
						<Button
							type="button"
							variant="link"
							size="sm"
							className="self-start"
							onClick={() => setExpanded((current) => !current)}
						>
							{expanded ? "Mostrar Menos" : `Mostrar Todos (+${hidden})`}
						</Button>
					) : null}
				</div>
			)}
		</section>
	);
};
