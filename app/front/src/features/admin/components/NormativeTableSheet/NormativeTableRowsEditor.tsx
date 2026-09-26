import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@components/ui/table";
import { padCount } from "@features/shared";
import type { NormativeTableCode } from "@services/normative-tables";
import { Plus, Trash2 } from "lucide-react";
import { type ReactNode, useId } from "react";
import {
	type Control,
	Controller,
	useFieldArray,
	useFormState,
} from "react-hook-form";

import {
	EMPTY_NORMATIVE_TABLE_ROW,
	type NormativeTableFormValues,
	type NormativeTableRowFormValues,
} from "../../schemas";

type NumericColumn = Exclude<keyof NormativeTableRowFormValues, "key">;

interface RowColumn {
	name: NumericColumn;
	header: ReactNode;
	label: string;
	numeric: boolean;
}

const VALUE_COLUMNS = ["value", "secondValue", "thirdValue"] as const;

// Keeps units such as "(m²)" out of the uppercase header.
const withUnits = (label: string) =>
	label.split(/(\([^)]*\))/).map((part, index) =>
		part.startsWith("(") ? (
			<span key={`${index}-${part}`} className="normal-case">
				{part}
			</span>
		) : (
			part
		),
	);

const buildColumns = (definition: NormativeTableCode): RowColumn[] => {
	const columns: RowColumn[] = [];

	if (definition.argumentLabel) {
		columns.push(
			{
				name: "lowerBound",
				header: <>{withUnits(definition.argumentLabel)} de</>,
				label: `${definition.argumentLabel} de`,
				numeric: true,
			},
			{
				name: "upperBound",
				header: "até",
				label: `${definition.argumentLabel} até`,
				numeric: true,
			},
		);
	}

	definition.valueLabels.forEach((label, index) => {
		columns.push({
			name: VALUE_COLUMNS[index],
			header: withUnits(label),
			label,
			numeric: true,
		});
	});

	columns.push({
		name: "label",
		header: "Rótulo",
		label: "Rótulo",
		numeric: false,
	});

	return columns;
};

interface CellErrorProps {
	id: string;
	message?: string;
}

const CellError = ({ id, message }: CellErrorProps) =>
	message ? (
		<p id={id} className="mt-1 text-xs whitespace-normal text-destructive">
			{message}
		</p>
	) : null;

interface RowInputProps {
	control: Control<NormativeTableFormValues>;
	index: number;
	column: RowColumn;
}

const RowInput = ({ control, index, column }: RowInputProps) => {
	const errorId = useId();

	return (
		<Controller
			control={control}
			name={`rows.${index}.${column.name}`}
			render={({ field, fieldState }) => (
				<>
					<Input
						{...field}
						variant="underline"
						inputMode={column.numeric ? "decimal" : undefined}
						aria-label={`${column.label}, linha ${index + 1}`}
						aria-invalid={fieldState.invalid || undefined}
						aria-describedby={fieldState.error ? errorId : undefined}
						className={column.numeric ? "h-9 min-w-20" : "h-9 min-w-32"}
					/>
					<CellError id={errorId} message={fieldState.error?.message} />
				</>
			)}
		/>
	);
};

interface RowKeySelectProps {
	control: Control<NormativeTableFormValues>;
	index: number;
	items: Record<string, string>;
	disabled: boolean;
}

const RowKeySelect = ({
	control,
	index,
	items,
	disabled,
}: RowKeySelectProps) => {
	const errorId = useId();

	return (
		<Controller
			control={control}
			name={`rows.${index}.key`}
			render={({ field, fieldState }) => (
				<>
					<Select
						items={items}
						value={field.value || null}
						onValueChange={(value) => field.onChange(value ?? "")}
						disabled={disabled}
					>
						<SelectTrigger
							ref={field.ref}
							onBlur={field.onBlur}
							variant="underline"
							aria-label={`Chave, linha ${index + 1}`}
							aria-invalid={fieldState.invalid || undefined}
							aria-describedby={fieldState.error ? errorId : undefined}
							className="h-9 min-w-40"
						>
							<SelectValue placeholder="Selecione" />
						</SelectTrigger>

						<SelectContent>
							{Object.entries(items).map(([value, label]) => (
								<SelectItem key={value} value={value}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<CellError id={errorId} message={fieldState.error?.message} />
				</>
			)}
		/>
	);
};

interface NormativeTableRowsEditorProps {
	control: Control<NormativeTableFormValues>;
	definition?: NormativeTableCode;
	readOnly: boolean;
}

export const NormativeTableRowsEditor = ({
	control,
	definition,
	readOnly,
}: NormativeTableRowsEditorProps) => {
	const headingId = useId();
	const rows = useFieldArray({ control, name: "rows" });
	const { errors } = useFormState({ control, name: "rows" });
	const rowsError = errors.rows?.root?.message ?? errors.rows?.message;

	const keyItems = Object.fromEntries(
		(definition?.keys ?? []).map(({ code, label }) => [code, label]),
	);
	const keyed = (definition?.keys.length ?? 0) > 0;
	const columns = definition ? buildColumns(definition) : [];

	return (
		<section className="flex flex-col gap-4" aria-labelledby={headingId}>
			<div className="flex min-h-12 items-center justify-between border-b border-foreground pb-3">
				<h3 id={headingId} className="text-base font-semibold text-foreground">
					Linhas
				</h3>

				{readOnly || !definition ? null : (
					<Button
						type="button"
						variant="link"
						size="sm"
						onClick={() => rows.append(EMPTY_NORMATIVE_TABLE_ROW)}
					>
						<Plus aria-hidden="true" />
						Adicionar linha
					</Button>
				)}
			</div>

			{definition ? (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-10 px-2">Nº</TableHead>
							{keyed ? <TableHead className="px-2">Chave</TableHead> : null}
							{columns.map((column) => (
								<TableHead
									key={column.name}
									className="px-2 align-bottom whitespace-normal"
								>
									{column.header}
								</TableHead>
							))}
							{readOnly ? null : (
								<TableHead className="w-10 px-2">
									<span className="sr-only">Ações</span>
								</TableHead>
							)}
						</TableRow>
					</TableHeader>

					<TableBody>
						{rows.fields.map((field, index) => (
							<TableRow key={field.id} className="hover:bg-transparent">
								<TableCell className="px-2 align-top font-mono text-xs text-muted-foreground">
									<span className="inline-block pt-2.5">
										{padCount(index + 1)}
									</span>
								</TableCell>

								{keyed ? (
									<TableCell className="px-2 align-top">
										<RowKeySelect
											control={control}
											index={index}
											items={keyItems}
											disabled={readOnly}
										/>
									</TableCell>
								) : null}

								{columns.map((column) => (
									<TableCell key={column.name} className="px-2 align-top">
										<RowInput control={control} index={index} column={column} />
									</TableCell>
								))}

								{readOnly ? null : (
									<TableCell className="px-2 align-top">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											onClick={() => rows.remove(index)}
											aria-label={`Remover linha ${index + 1}`}
											className="text-destructive"
										>
											<Trash2 aria-hidden="true" />
										</Button>
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : (
				<p className="text-sm text-muted-foreground">
					Selecione a tabela para ver as colunas que ela usa.
				</p>
			)}

			{rowsError ? (
				<p role="alert" className="text-sm text-destructive">
					{rowsError}
				</p>
			) : null}
		</section>
	);
};
