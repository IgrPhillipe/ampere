import { type FieldVariant, FormField } from "@components/form/FormField";
import {
	InfiniteCombobox,
	type InfiniteComboboxProps,
} from "@components/InfiniteCombobox";
import { ComboboxTrigger } from "@components/ui/combobox";
import { FieldControl } from "@components/ui/field";
import { selectTriggerVariants } from "@components/ui/select";
import { cn } from "@lib/utils";
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

interface ControlledInfiniteComboboxProps<T extends FieldValues>
	extends Omit<
		InfiniteComboboxProps,
		| "value"
		| "onValueChange"
		| "trigger"
		| "footer"
		| "contentClassName"
		| "disabled"
	> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: ReactNode;
	placeholder: string;
	disabled?: boolean;
	variant?: FieldVariant;
	required?: boolean;
	className?: string;
	fieldClassName?: string;
}

/** A select over a server list too long to load at once; the value is the option id. */
export const ControlledInfiniteCombobox = <T extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	disabled,
	variant = "underline",
	required = false,
	className,
	fieldClassName,
	...comboboxProps
}: ControlledInfiniteComboboxProps<T>) => (
	<Controller
		control={control}
		name={name}
		render={({ field, fieldState }) => (
			<FormField
				label={label}
				error={fieldState.error?.message}
				variant={variant}
				required={required}
				className={fieldClassName}
			>
				<InfiniteCombobox
					{...comboboxProps}
					value={field.value || null}
					onValueChange={(next) => field.onChange(next ?? "")}
					disabled={disabled}
					contentClassName="w-(--anchor-width) min-w-72"
					trigger={(selected) => (
						<FieldControl
							render={
								<ComboboxTrigger
									className={cn(selectTriggerVariants({ variant }), className)}
									aria-required={required || undefined}
								>
									<span
										className={cn(
											"truncate",
											!selected && "text-muted-foreground",
										)}
									>
										{selected?.label ?? placeholder}
									</span>
									<ChevronDownIcon
										aria-hidden="true"
										className="text-muted-foreground"
									/>
								</ComboboxTrigger>
							}
							name={field.name}
							onBlur={field.onBlur}
							ref={field.ref}
						/>
					)}
				/>
			</FormField>
		)}
	/>
);
