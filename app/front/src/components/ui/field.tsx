import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cn } from "@lib/utils";

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
	return (
		<FieldPrimitive.Root
			data-slot="field"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
	return (
		<FieldPrimitive.Label
			data-slot="field-label"
			className={cn(
				"flex items-center gap-2 text-sm leading-none font-medium select-none data-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

function FieldControl({ className, ...props }: FieldPrimitive.Control.Props) {
	return (
		<FieldPrimitive.Control
			data-slot="field-control"
			className={className}
			{...props}
		/>
	);
}

function FieldDescription({
	className,
	...props
}: FieldPrimitive.Description.Props) {
	return (
		<FieldPrimitive.Description
			data-slot="field-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function FieldError({ className, ...props }: FieldPrimitive.Error.Props) {
	return (
		<FieldPrimitive.Error
			data-slot="field-error"
			role="alert"
			className={cn("text-sm font-medium text-destructive", className)}
			{...props}
		/>
	);
}

export { Field, FieldControl, FieldDescription, FieldError, FieldLabel };
