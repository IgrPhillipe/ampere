import { ConclusionField } from "@components/ConclusionField";
import { padCount } from "@features/shared";
import type { VersionComparison } from "@services/project-versions";

import { buildVersionChanges, formatVersion } from "../../constants";

interface VersionChangesFieldProps {
	comparison?: VersionComparison;
	isError?: boolean;
	className?: string;
}

/** The conclusion of the comparison: how many things changed, and which. */
export const VersionChangesField = ({
	comparison,
	isError = false,
	className,
}: VersionChangesFieldProps) => {
	const changes = comparison ? buildVersionChanges(comparison) : [];

	return (
		<ConclusionField
			title="O que mudou"
			value={comparison ? padCount(changes.length) : "—"}
			caption={
				comparison
					? `${changes.length === 1 ? "Alteração" : "Alterações"} na ${formatVersion(comparison.to.number)}`
					: isError
						? "Comparativo indisponível"
						: "Carregando o comparativo"
			}
			className={className}
		>
			{changes.length > 0 ? (
				<ol className="flex flex-col">
					{changes.map((change, index) => (
						<li
							key={`${change.title}-${index}`}
							className="flex flex-col gap-1.5 border-t border-primary-foreground/30 py-4"
						>
							<p className="flex gap-3 text-base font-medium">
								<span className="font-mono text-xs font-normal opacity-70">
									{padCount(index + 1)}
								</span>
								{change.title}
							</p>
							<p className="text-sm opacity-90">{change.detail}</p>
						</li>
					))}
				</ol>
			) : comparison ? (
				<p className="text-sm opacity-90">Nada mudou entre as duas versões.</p>
			) : null}
		</ConclusionField>
	);
};
