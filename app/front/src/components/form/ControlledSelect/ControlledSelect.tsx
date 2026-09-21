import { FormField } from "@components/form/FormField";
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
	items: Record<string, string>;
	disabled?: boolean;
}

export const ControlledSelect = <T extends FieldValues>({
	control,
	name,
	label,
	description,
	placeholder = "Selecione uma opção",
	items,
	disabled,
}: ControlledSelectProps<T>) => (
	<Controller
		control={control}
		name={name}
		render={({ field, fieldState }) => (
			<FormField
				label={label}
				description={description}
				error={fieldState.error?.message}
			>
				<Select
					items={items}
					value={field.value || null}
					onValueChange={(value) => field.onChange(value ?? "")}
					disabled={disabled}
				>
					<FieldControl
						render={
							<SelectTrigger>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						}
						name={field.name}
						onBlur={field.onBlur}
						ref={field.ref}
					/>

					<SelectContent>
						{Object.entries(items).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
		)}
	/>
);
