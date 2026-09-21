import { type FieldVariant, FormField } from "@components/form/FormField";
import { FieldControl } from "@components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import type { ReactNode } from "react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

interface ControlledSelectProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: ReactNode;
	description?: ReactNode;
	placeholder?: string;
	/**
	 * Mapa `valor -> rotulo`. O `Select` do Base UI precisa dele para o gatilho
	 * mostrar o texto do item em vez do valor cru; ver `components/ui/select`.
	 */
	items: Record<string, string>;
	disabled?: boolean;
	/** Aplica a mesma variante ao rotulo e ao gatilho. */
	variant?: FieldVariant;
	/** Classe do gatilho. */
	className?: string;
	/** Classe do campo inteiro (o `Field`), nao do gatilho. */
	fieldClassName?: string;
}

/**
 * Select ligado ao react-hook-form, par do `ControlledInput`.
 *
 * O `Select` do Base UI trata a ausencia de valor como `null`, mas o
 * react-hook-form entrega `""` no primeiro render; a conversao nos dois
 * sentidos fica aqui para o schema continuar vendo apenas `""` ou o literal.
 */
export const ControlledSelect = <T extends FieldValues>({
	control,
	name,
	label,
	description,
	placeholder = "Selecione uma opção",
	items,
	disabled,
	variant = "default",
	className,
	fieldClassName,
}: ControlledSelectProps<T>) => (
	<Controller
		control={control}
		name={name}
		render={({ field, fieldState }) => (
			<FormField
				label={label}
				description={description}
				error={fieldState.error?.message}
				variant={variant}
				className={fieldClassName}
			>
				<Select
					items={items}
					value={field.value || null}
					onValueChange={(value) => field.onChange(value ?? "")}
					disabled={disabled}
				>
					<FieldControl
						render={
							<SelectTrigger variant={variant} className={className}>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						}
						name={field.name}
						onBlur={field.onBlur}
						ref={field.ref}
					/>

					<SelectContent>
						{Object.entries(items).map(([value, itemLabel]) => (
							<SelectItem key={value} value={value}>
								{itemLabel}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
		)}
	/>
);
