import { type FieldVariant, FormField } from "@components/form/FormField";
import {
	Combobox,
	ComboboxContent,
	ComboboxItem,
	ComboboxTrigger,
} from "@components/ui/combobox";
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

interface ControlledComboboxProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: ReactNode;
	description?: ReactNode;
	placeholder: string;
	searchPlaceholder: string;
	emptyMessage: string;
	/** Text options: the value is the label. */
	options: readonly string[];
	disabled?: boolean;
	variant?: FieldVariant;
	required?: boolean;
	className?: string;
	fieldClassName?: string;
}

/** A select with a search field, for lists too long to scroll. */
export const ControlledCombobox = <T extends FieldValues>({
	control,
	name,
	label,
	description,
	placeholder,
	searchPlaceholder,
	emptyMessage,
	options,
	disabled,
	variant = "default",
	required = false,
	className,
	fieldClassName,
}: ControlledComboboxProps<T>) => (
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
				<Combobox
					items={options}
					value={field.value || null}
					onValueChange={(value: string | null) => field.onChange(value ?? "")}
					locale="pt-BR"
					disabled={disabled}
				>
					<FieldControl
						render={
							<ComboboxTrigger
								className={cn(selectTriggerVariants({ variant }), className)}
								aria-required={required || undefined}
							>
								<span
									className={cn(
										"truncate",
										!field.value && "text-muted-foreground",
									)}
								>
									{field.value || placeholder}
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

					<ComboboxContent
						searchPlaceholder={searchPlaceholder}
						emptyMessage={emptyMessage}
						className="w-(--anchor-width) min-w-72"
					>
						{(option: string) => (
							<ComboboxItem key={option} value={option}>
								{option}
							</ComboboxItem>
						)}
					</ComboboxContent>
				</Combobox>
			</FormField>
		)}
	/>
);
