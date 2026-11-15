import { ControlledInput, ControlledSelect } from "@components/form";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { padCount } from "@features/shared";
import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import {
	type ArrayPath,
	type Control,
	type FieldArray,
	type FieldValues,
	type Path,
	useFieldArray,
	useWatch,
} from "react-hook-form";

import {
	lampTechnologyItems,
	loadCategoryItems,
	powerUnitItems,
	yesNoItems,
} from "../../constants";
import type { LoadItemFormValues } from "../../schemas";
import { EMPTY_LOAD_ITEM } from "./load-item";

type WithLoadItems = FieldValues & { items: LoadItemFormValues[] };

interface LoadItemsSectionProps<T extends WithLoadItems> {
	control: Control<T>;
	readOnly: boolean;
	title: ReactNode;
	emptyHint: string;
	/** Error of the whole list, such as a three-phase apartment without loads. */
	error?: string;
	meta?: ReactNode;
}

export const LoadItemsSection = <T extends WithLoadItems>({
	control,
	readOnly,
	title,
	emptyHint,
	error,
	meta,
}: LoadItemsSectionProps<T>) => {
	const items = useFieldArray({
		control,
		name: "items" as ArrayPath<T>,
	});
	// `form.watch` is memoized by the React Compiler.
	const values = useWatch({ control, name: "items" as Path<T> }) as
		| LoadItemFormValues[]
		| undefined;
	const categories = (values ?? []).map(({ category }) => category);
	const field = (index: number, name: keyof LoadItemFormValues) =>
		`items.${index}.${name}` as Path<T>;

	return (
		<section className="flex flex-col gap-6">
			<SectionHeading
				as="h3"
				meta={meta}
				actions={
					readOnly ? null : (
						<Button
							type="button"
							variant="link"
							size="sm"
							className="h-auto px-0"
							onClick={() =>
								items.append(EMPTY_LOAD_ITEM as FieldArray<T, ArrayPath<T>>)
							}
						>
							<Plus aria-hidden="true" />
							Adicionar Carga
						</Button>
					)
				}
			>
				{title}
			</SectionHeading>

			{items.fields.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					{readOnly ? "Nenhuma carga informada." : emptyHint}
				</p>
			) : null}

			{error ? (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			) : null}

			<ol className="flex flex-col gap-8">
				{items.fields.map((item, index) => (
					<li
						key={item.id}
						className="grid grid-cols-[2rem_minmax(0,1fr)] gap-y-6"
					>
						<span className="pt-6 font-mono text-sm text-muted-foreground">
							{padCount(index + 1)}
						</span>

						<div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
							<ControlledSelect
								control={control}
								name={field(index, "category")}
								label="Parcela"
								items={loadCategoryItems}
								variant="underline"
								fieldClassName="sm:col-span-2"
							/>

							<ControlledInput
								control={control}
								name={field(index, "description")}
								label="Descrição"
								placeholder="Ex.: Elevador"
								required
								variant="underline"
								fieldClassName="sm:col-span-2"
							/>

							<ControlledInput
								control={control}
								name={field(index, "quantity")}
								label="Quantidade"
								type="number"
								min={1}
								step={1}
								inputMode="numeric"
								required
								variant="underline"
							/>

							<div className="grid grid-cols-[minmax(0,1fr)_5rem] items-end gap-3">
								<ControlledInput
									control={control}
									name={field(index, "power")}
									label="Potência de placa"
									type="number"
									min={0}
									step="0.01"
									inputMode="decimal"
									variant="underline"
								/>

								<ControlledSelect
									control={control}
									name={field(index, "powerUnit")}
									label={<span className="sr-only">Unidade</span>}
									items={powerUnitItems}
									variant="underline"
								/>
							</div>

							{categories[index] === "LIGHTING_AND_OUTLETS" ? (
								<ControlledSelect
									control={control}
									name={field(index, "lampTechnology")}
									label="Iluminação ou tomadas"
									placeholder="Não informado"
									items={lampTechnologyItems}
									variant="underline"
									fieldClassName="sm:col-span-2"
								/>
							) : null}

							{categories[index] === "MOTORS" ? (
								<ControlledSelect
									control={control}
									name={field(index, "simultaneousStart")}
									label="Partida simultânea com outros motores?"
									placeholder="Não informado"
									items={yesNoItems}
									variant="underline"
									fieldClassName="sm:col-span-2"
								/>
							) : null}

							{readOnly ? null : (
								<Button
									type="button"
									variant="destructive-ghost"
									size="sm"
									onClick={() => items.remove(index)}
									className="justify-self-start sm:col-span-2"
								>
									<Trash2 aria-hidden="true" />
									Remover Carga
								</Button>
							)}
						</div>
					</li>
				))}
			</ol>
		</section>
	);
};
