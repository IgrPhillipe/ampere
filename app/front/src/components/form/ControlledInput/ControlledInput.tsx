import { FormField } from "@components/form/FormField";
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
	extends Omit<ComponentProps<typeof Input>, "name" | "defaultValue"> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: ReactNode;
	description?: ReactNode;
}

export const ControlledInput = <T extends FieldValues>({
	control,
	name,
	label,
	description,
	className,
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
			>
				<FieldControl
					render={<Input className={className} />}
					{...inputProps}
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
