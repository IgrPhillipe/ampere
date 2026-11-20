import { Button } from "@components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxItem,
	ComboboxTrigger,
} from "@components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { formatPlace } from "@features/shared";
import type {
	ReviewerDistribution,
	ReviewerMunicipality,
} from "@services/reviewer-distribution";
import { Plus, X } from "lucide-react";
import { useState } from "react";

import {
	getMunicipalityOptions,
	municipalityKey,
	sortMunicipalities,
} from "../../constants";

interface MunicipalitiesDialogProps {
	open: boolean;
	/** Kept after closing, so the dialog does not empty mid-animation. */
	reviewer: ReviewerDistribution | null;
	distribution: ReviewerDistribution[];
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (municipalities: ReviewerMunicipality[]) => void;
}

interface MunicipalitiesFormProps
	extends Omit<
		MunicipalitiesDialogProps,
		"open" | "reviewer" | "onOpenChange"
	> {
	reviewer: ReviewerDistribution;
	onCancel: () => void;
}

const MunicipalitiesForm = ({
	reviewer,
	distribution,
	isPending,
	onCancel,
	onSave,
}: MunicipalitiesFormProps) => {
	const options = getMunicipalityOptions(distribution, reviewer.reviewer.id);
	const optionsByKey = new Map(options.map((option) => [option.key, option]));
	const [selected, setSelected] = useState<string[]>(() =>
		reviewer.municipalities.map(municipalityKey),
	);
	const places = sortMunicipalities(
		selected.flatMap((key) => {
			const option = optionsByKey.get(key);
			return option ? [option.place] : [];
		}),
	);

	const remove = (key: string) =>
		setSelected((current) => current.filter((item) => item !== key));

	return (
		<>
			<div className="flex flex-col gap-4">
				<Combobox
					items={options.map(({ key }) => key)}
					multiple
					value={selected}
					onValueChange={(next: string[]) => setSelected(next)}
					itemToStringLabel={(key: string) =>
						optionsByKey.get(key)?.label ?? key
					}
					locale="pt-BR"
					disabled={isPending}
				>
					<ComboboxTrigger
						render={
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="self-start"
								aria-label="Adicionar município"
							/>
						}
					>
						<Plus aria-hidden="true" />
						Adicionar Município
					</ComboboxTrigger>

					<ComboboxContent
						searchPlaceholder="Buscar município"
						emptyMessage="Nenhum município encontrado."
						className="w-80"
					>
						{(key: string) => {
							const option = optionsByKey.get(key);

							return (
								<ComboboxItem
									key={key}
									value={key}
									disabled={Boolean(option?.heldBy)}
								>
									<span className="flex min-w-0 flex-col">
										<span className="truncate">{option?.label ?? key}</span>
										{option?.heldBy ? (
											<span className="text-xs text-muted-foreground">
												Com {option.heldBy}
											</span>
										) : null}
									</span>
								</ComboboxItem>
							);
						}}
					</ComboboxContent>
				</Combobox>

				{places.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Nenhum município. Os projetos enviados ficam "Não Atribuído" até o
						gestor atribuir.
					</p>
				) : (
					<ul
						aria-label={`Municípios de ${reviewer.reviewer.name}`}
						className="flex max-h-64 flex-wrap gap-2 overflow-y-auto"
					>
						{places.map((place) => {
							const key = municipalityKey(place);
							const label = formatPlace(place.municipality, place.state);

							return (
								<li
									key={key}
									className="inline-flex items-center gap-1 border border-border py-1 pr-1 pl-2 text-sm"
								>
									{label}
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										className="size-6"
										aria-label={`Remover ${label}`}
										disabled={isPending}
										onClick={() => remove(key)}
									>
										<X aria-hidden="true" />
									</Button>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<DialogFooter>
				<Button
					type="button"
					variant="ghost"
					onClick={onCancel}
					disabled={isPending}
				>
					Cancelar
				</Button>
				<Button
					type="button"
					onClick={() => onSave(places)}
					disabled={isPending}
				>
					{isPending ? "Salvando..." : "Salvar Municípios"}
				</Button>
			</DialogFooter>
		</>
	);
};

/** Edits the municipalities of one analyst; those held by another one stay disabled. */
export const MunicipalitiesDialog = ({
	open,
	reviewer,
	distribution,
	isPending,
	onOpenChange,
	onSave,
}: MunicipalitiesDialogProps) => (
	<Dialog
		open={open}
		onOpenChange={(open) => {
			if (!isPending) onOpenChange(open);
		}}
	>
		<DialogContent className="bg-card sm:max-w-xl" showCloseButton={!isPending}>
			<DialogHeader>
				<DialogTitle className="font-heading text-xl">
					Municípios do Analista
				</DialogTitle>
				<DialogDescription>
					Os projetos enviados destes municípios vão direto para{" "}
					{reviewer?.reviewer.name ?? "o analista"}. Um município pertence a um
					analista só.
				</DialogDescription>
			</DialogHeader>

			{reviewer ? (
				<MunicipalitiesForm
					// Closing remounts it, so a cancelled edit is gone on reopening.
					key={open ? reviewer.reviewer.id : "closed"}
					reviewer={reviewer}
					distribution={distribution}
					isPending={isPending}
					onCancel={() => onOpenChange(false)}
					onSave={onSave}
				/>
			) : null}
		</DialogContent>
	</Dialog>
);
