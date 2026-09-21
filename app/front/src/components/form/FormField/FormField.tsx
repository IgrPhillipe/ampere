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
	/** Mensagem vinda do `fieldState.error` do react-hook-form. */
	error?: string;
	children: ReactNode;
	className?: string;
}

/** Casca de um campo: rotulo, controle, descricao e erro. */
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
