import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@components/ui/field";
import type { ReactNode } from "react";

interface FormFieldProps {
	label?: ReactNode;
	description?: ReactNode;
	/** Message coming from react-hook-form's `fieldState.error`. */
	error?: string;
	children: ReactNode;
	className?: string;
}

export const FormField = ({
	label,
	description,
	error,
	children,
	className,
}: FormFieldProps) => (
	<Field className={className} invalid={Boolean(error)}>
		{label ? <FieldLabel>{label}</FieldLabel> : null}

		{children}

		{description ? <FieldDescription>{description}</FieldDescription> : null}

		{error ? <FieldError match>{error}</FieldError> : null}
	</Field>
);
