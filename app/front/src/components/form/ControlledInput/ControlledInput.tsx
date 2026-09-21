import { type FieldVariant, FormField } from "@components/form/FormField";
import { FieldControl } from "@components/ui/field";
import { Input } from "@components/ui/input";
import type { ComponentProps, ReactNode } from "react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

interface ControlledInputProps<T extends FieldValues>
	extends Omit<
		ComponentProps<typeof Input>,
		"name" | "defaultValue" | "variant"
	> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: ReactNode;
	description?: ReactNode;
	/** Aplica a mesma variante ao rotulo e ao controle. */
	variant?: FieldVariant;
	/** Marca o campo no rotulo e expoe `aria-required` no controle. */
	required?: boolean;
	/** Classe do campo inteiro (o `Field`), nao do `input`. */
	fieldClassName?: string;
}

export const ControlledInput = <T extends FieldValues>({
	control,
	name,
	label,
	description,
	variant = "default",
	required = false,
	className,
	fieldClassName,
	...inputProps
}: ControlledInputProps<T>) => (
	<Controller
		control={control}
		name={name}
		render={({ field, fieldState }) => (
			<FormField
				label={label}
				description={description}
				error={fieldState.error?.message}
				variant={variant}
				required={required}
				className={fieldClassName}
			>
				<FieldControl
					render={<Input variant={variant} className={className} />}
					{...inputProps}
					required={required}
					name={field.name}
					value={field.value ?? ""}
					onValueChange={undefined}
					onChange={field.onChange}
					onBlur={field.onBlur}
					ref={field.ref}
				/>
			</FormField>
		)}
	/>
);
