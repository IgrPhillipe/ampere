import { type FieldVariant, FormField } from "@components/form/FormField";
import { FieldControl } from "@components/ui/field";
import { Textarea } from "@components/ui/textarea";
import type { ComponentProps, ReactNode } from "react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

interface ControlledTextareaProps<T extends FieldValues>
	extends Omit<
		ComponentProps<typeof Textarea>,
		"name" | "defaultValue" | "variant"
	> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: ReactNode;
	description?: ReactNode;
	variant?: FieldVariant;
	required?: boolean;
	fieldClassName?: string;
}

export const ControlledTextarea = <T extends FieldValues>({
	control,
	name,
	label,
	description,
	variant = "underline",
	required = false,
	className,
	fieldClassName,
	...textareaProps
}: ControlledTextareaProps<T>) => (
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
					render={
						<Textarea
							variant={variant}
							className={className}
							{...textareaProps}
						/>
					}
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
