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
	/** Marca o campo como obrigatorio no rotulo e no `aria` do controle. */
	required?: boolean;
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
	required = false,
	children,
	className,
}: FormFieldProps) => (
	<Field className={className} invalid={Boolean(error)}>
		{label ? (
			<FieldLabel variant={variant}>
				{/* Um filho so: o `FieldLabel` e flex com `gap-2`, entao o marcador
				    solto ficava descolado do texto. */}
				<span>
					{label}

					{required ? (
						<>
							{/* O asterisco e decorativo; quem usa leitor de tela ouve a
							    palavra, que entra no nome acessivel do controle pelo
							    `aria-labelledby` que o `Field` do Base UI amarra. */}
							<span aria-hidden="true" className="ml-0.5">
								*
							</span>
							<span className="sr-only">(obrigatório)</span>
						</>
					) : null}
				</span>
			</FieldLabel>
		) : null}

		{children}

		{description ? <FieldDescription>{description}</FieldDescription> : null}

		{error ? <FieldError match>{error}</FieldError> : null}
	</Field>
);
