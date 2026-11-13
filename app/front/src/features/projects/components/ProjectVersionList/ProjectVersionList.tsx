import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate, formatKva, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectVersion, VersionFile } from "@services/project-versions";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Download, GitCompareArrows } from "lucide-react";

import { formatVersion } from "../../constants";

/** A file of a version being fetched. */
export interface VersionDownload {
	version: number;
	file: VersionFile;
}

interface ProjectVersionListProps {
	versions?: ProjectVersion[];
	isLoading?: boolean;
	onDownload: (download: VersionDownload) => void;
	downloading?: VersionDownload;
	/** Present when the list offers the comparison of two versions. */
	onCompare?: () => void;
	className?: string;
}

const MEMORIAL: VersionFile = { kind: "memorial" };

interface FileButtonProps {
	label: string;
	ariaLabel: string;
	busy: boolean;
	onClick: () => void;
	className?: string;
}

const FileButton = ({
	label,
	ariaLabel,
	busy,
	onClick,
	className,
}: FileButtonProps) => (
	<Button
		type="button"
		variant="link"
		size="xs"
		className={cn(
			"h-auto px-0 font-mono text-2xs tracking-[0.11em] uppercase",
			className,
		)}
		aria-label={ariaLabel}
		disabled={busy}
		onClick={onClick}
	>
		{busy ? "Baixando..." : label}
		<Download aria-hidden="true" />
	</Button>
);

/** The submissions as they were frozen, each with its memorial and documents. */
export const ProjectVersionList = ({
	versions,
	isLoading = false,
	onDownload,
	downloading,
	onCompare,
	className,
}: ProjectVersionListProps) => {
	const sorted = [...(versions ?? [])].sort((a, b) => b.number - a.number);
	const isDownloading = (version: number, file: VersionFile) =>
		downloading?.version === version &&
		downloading.file.kind === file.kind &&
		(file.kind !== "document" ||
			(downloading.file.kind === "document" &&
				downloading.file.type === file.type));

	return (
		<section
			aria-labelledby="versoes-titulo"
			className={cn("flex flex-col gap-4", className)}
		>
			<SectionHeading
				id="versoes-titulo"
				meta={
					versions
						? `${padCount(versions.length)} ${versions.length === 1 ? "versão" : "versões"}`
						: undefined
				}
			>
				Versões Registradas
			</SectionHeading>

			{isLoading ? (
				<div className="flex flex-col gap-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			) : sorted.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Nenhuma versão enviada ainda. O memorial oficial é gravado no envio.
				</p>
			) : (
				<ul aria-label="Versões enviadas" className="flex flex-col">
					{sorted.map((version) => {
						const label = formatVersion(version.number);

						return (
							<li
								key={version.number}
								className="flex flex-col gap-1.5 border-b border-border py-3 last:border-b-0"
							>
								<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
									<span className="font-mono text-xs text-faint-foreground">
										{label}
									</span>
									<time
										dateTime={version.submittedAt}
										className="font-mono text-sm text-foreground"
									>
										{formatDate(version.submittedAt)}
									</time>
									<span className="font-mono text-sm text-muted-foreground">
										{formatKva(version.demandKva, 1)}
									</span>
									<FileButton
										className="ml-auto"
										label="Memorial PDF"
										ariaLabel={`Baixar o memorial da ${label}`}
										busy={isDownloading(version.number, MEMORIAL)}
										onClick={() =>
											onDownload({ version: version.number, file: MEMORIAL })
										}
									/>
								</div>
								<div className="flex flex-wrap items-baseline gap-x-3 text-xs text-muted-foreground">
									{version.authorName ? (
										<span>Enviada por {version.authorName}</span>
									) : null}
									{version.verificationCode ? (
										<Link
											to="/verificar-autenticidade"
											search={{ codigo: version.verificationCode }}
											className="font-mono tracking-[0.11em] underline-offset-4 hover:text-foreground hover:underline"
											aria-label={`Verificar o código ${version.verificationCode}`}
										>
											{version.verificationCode}
										</Link>
									) : null}
								</div>
								{version.changeSummary ? (
									<p className="text-xs text-muted-foreground">
										Resumo das alterações: {version.changeSummary}
									</p>
								) : null}
								{version.documents.length > 0 ? (
									<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted-foreground">
										<span>Documentos enviados:</span>
										{version.documents.map((document) => {
											const file: VersionFile = {
												kind: "document",
												type: document.type,
											};

											return (
												<FileButton
													key={document.type}
													label={document.typeLabel}
													ariaLabel={`Baixar ${document.typeLabel} da ${label}`}
													busy={isDownloading(version.number, file)}
													onClick={() =>
														onDownload({ version: version.number, file })
													}
												/>
											);
										})}
									</div>
								) : null}
							</li>
						);
					})}
				</ul>
			)}

			<div className="flex flex-wrap items-center justify-between gap-3">
				{onCompare && sorted.length >= 2 ? (
					<Button type="button" variant="outline" size="sm" onClick={onCompare}>
						<GitCompareArrows aria-hidden="true" />
						Comparar Versões
					</Button>
				) : null}
				<Link
					to="/verificar-autenticidade"
					className="inline-flex items-center gap-1 font-mono text-2xs tracking-[0.11em] text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline"
				>
					Verificar Autenticidade pelo Código
					<ArrowRight aria-hidden="true" className="size-3" />
				</Link>
			</div>
		</section>
	);
};
