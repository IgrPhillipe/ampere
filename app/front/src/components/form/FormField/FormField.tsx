import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@components/ui/field";
import type { ReactNode } from "react";

export type FieldVariant = "default" | "underline";

interface FormFieldProps {
	label?: ReactNode;
	description?: ReactNode;
	/** Mensagem vinda do `fieldState.error` do react-hook-form. */
	error?: string;
	/** Casa o rotulo com a variante do controle; ver `components/ui/input`. */
	variant?: FieldVariant;
	children: ReactNode;
	className?: string;
}

/**
 * Casca de um campo: rotulo, controle, descricao e erro.
 *
 * Usa o `Field` do Base UI, que amarra sozinho os ids de `label`,
 * `aria-describedby` e `aria-invalid`. O `match` no erro entrega o controle
 * de visibilidade ao react-hook-form em vez da validacao nativa do browser.
 */
export const FormField = ({
	label,
	description,
	error,
	variant = "default",
	children,
	className,
}: FormFieldProps) => (
	<Field className={className} invalid={Boolean(error)}>
		{label ? <FieldLabel variant={variant}>{label}</FieldLabel> : null}

		{children}

		{description ? <FieldDescription>{description}</FieldDescription> : null}

		{error ? <FieldError match>{error}</FieldError> : null}
	</Field>
);
