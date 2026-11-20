import { SectionHeading } from "@components/SectionHeading";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate, formatKva, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectVersion, VersionFile } from "@services/project-versions";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Download, GitCompareArrows } from "lucide-react";

import { formatKvaDelta, formatVersion } from "../../constants";
import type { ComparedVersions } from "../VersionComparisonView";

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
	/** Present when the list offers to compare a version with the one before it. */
	onCompare?: (compared: ComparedVersions) => void;
	className?: string;
}

const MEMORIAL: VersionFile = { kind: "memorial" };
const APPROVAL_MEMORIAL: VersionFile = { kind: "approval-memorial" };

interface FileButtonProps {
	label: string;
	ariaLabel: string;
	busy: boolean;
	onClick: () => void;
}

const FileButton = ({ label, ariaLabel, busy, onClick }: FileButtonProps) => (
	<Button
		type="button"
		variant="outline"
		size="xs"
		aria-label={ariaLabel}
		disabled={busy}
		onClick={onClick}
	>
		<Download aria-hidden="true" />
		{busy ? "Baixando..." : label}
	</Button>
);

const VerificationLink = ({ code }: { code: string }) => (
	<Link
		to="/verificar-autenticidade"
		search={{ codigo: code }}
		className="font-mono tracking-[0.11em] text-foreground underline-offset-4 hover:underline"
		aria-label={`Verificar o código ${code}`}
	>
		{code}
	</Link>
);

const Caption = ({ children }: { children: string }) => (
	<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
		{children}
	</span>
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
				Versões Enviadas
			</SectionHeading>

			{isLoading ? (
				<div className="flex flex-col gap-3">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			) : sorted.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Nenhuma versão enviada ainda. Cada envio grava uma versão, com o
					memorial e os documentos daquele momento.
				</p>
			) : (
				<ol aria-label="Versões enviadas" className="flex flex-col">
					{sorted.map((version, index) => {
						const label = formatVersion(version.number);
						const previous = sorted[index + 1];
						const delta = previous
							? version.demandKva - previous.demandKva
							: undefined;

						return (
							<li
								key={version.number}
								className="flex flex-col gap-3 border-b border-border py-4 first:pt-0 last:border-b-0"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex min-w-0 flex-col gap-1">
										<p className="flex items-center gap-2.5">
											<span className="font-heading text-base font-medium text-foreground">
												Versão {version.number}
											</span>
											{index === 0 ? <Badge variant="tag">Atual</Badge> : null}
										</p>
										<p className="text-xs text-muted-foreground">
											Enviada em{" "}
											<time dateTime={version.submittedAt}>
												{formatDate(version.submittedAt)}
											</time>
											{version.authorName ? ` por ${version.authorName}` : null}
										</p>
									</div>

									<div className="flex shrink-0 flex-col items-end gap-1">
										<span className="font-mono text-sm text-foreground">
											{formatKva(version.demandKva, 1)}
										</span>
										{delta !== undefined ? (
											<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
												{delta === 0
													? "Demanda igual"
													: `${formatKvaDelta(delta)} kVA`}
											</span>
										) : null}
									</div>
								</div>

								{version.changeSummary ? (
									<div className="flex flex-col gap-1 border-l-2 border-border-strong pl-3">
										<Caption>O que o projetista mudou</Caption>
										<p className="text-sm text-foreground">
											{version.changeSummary}
										</p>
									</div>
								) : null}

								{version.approvalMemorial ? (
									<p className="text-xs text-muted-foreground">
										Aprovada com ressalvas em{" "}
										{formatDate(version.approvalMemorial.issuedAt)}
									</p>
								) : null}

								<div className="flex flex-col gap-1.5">
									<Caption>Arquivos</Caption>
									<div className="flex flex-wrap gap-1.5">
										<FileButton
											label="Memorial"
											ariaLabel={`Baixar o memorial da ${label}`}
											busy={isDownloading(version.number, MEMORIAL)}
											onClick={() =>
												onDownload({ version: version.number, file: MEMORIAL })
											}
										/>
										{version.approvalMemorial ? (
											<FileButton
												label="Memorial da Aprovação"
												ariaLabel={`Baixar o memorial da aprovação da ${label}`}
												busy={isDownloading(version.number, APPROVAL_MEMORIAL)}
												onClick={() =>
													onDownload({
														version: version.number,
														file: APPROVAL_MEMORIAL,
													})
												}
											/>
										) : null}
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
								</div>

								{version.verificationCode || version.approvalMemorial ? (
									<dl className="flex flex-col gap-1 text-xs text-muted-foreground">
										{version.verificationCode ? (
											<div className="flex flex-wrap gap-x-2">
												<dt>Código do memorial</dt>
												<dd>
													<VerificationLink code={version.verificationCode} />
												</dd>
											</div>
										) : null}
										{version.approvalMemorial ? (
											<div className="flex flex-wrap gap-x-2">
												<dt>Código da aprovação</dt>
												<dd>
													<VerificationLink
														code={version.approvalMemorial.verificationCode}
													/>
												</dd>
											</div>
										) : null}
									</dl>
								) : null}

								{onCompare && previous ? (
									<Button
										type="button"
										variant="link"
										size="sm"
										className="h-auto self-start px-0"
										onClick={() =>
											onCompare({ from: previous.number, to: version.number })
										}
									>
										<GitCompareArrows aria-hidden="true" />
										Comparar com a Versão {previous.number}
									</Button>
								) : null}
							</li>
						);
					})}
				</ol>
			)}

			<Link
				to="/verificar-autenticidade"
				className="inline-flex items-center gap-1 self-start font-mono text-2xs tracking-[0.11em] text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline"
			>
				Verificar Autenticidade de um Memorial
				<ArrowRight aria-hidden="true" className="size-3" />
			</Link>
		</section>
	);
};
