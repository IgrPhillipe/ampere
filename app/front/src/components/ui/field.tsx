import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cn } from "@lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
	return (
		<FieldPrimitive.Root
			data-slot="field"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

const fieldLabelVariants = cva(
	"flex items-center gap-2 leading-none select-none data-disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "text-sm font-medium",
				/** Rotulo do campo `underline`: sobrescrita curta acima da linha. */
				underline:
					"text-xs font-normal tracking-wider text-muted-foreground uppercase",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type FieldLabelProps = FieldPrimitive.Label.Props &
	VariantProps<typeof fieldLabelVariants>;

function FieldLabel({ className, variant, ...props }: FieldLabelProps) {
	return (
		<FieldPrimitive.Label
			data-slot="field-label"
			className={cn(fieldLabelVariants({ variant }), className)}
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

export {
	Field,
	FieldControl,
	FieldDescription,
	FieldError,
	FieldLabel,
	fieldLabelVariants,
};
