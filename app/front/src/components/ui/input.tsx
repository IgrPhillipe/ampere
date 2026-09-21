import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
	"h-11 w-full min-w-0 text-base text-foreground transition-[border-color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:mr-3 file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-disabled-foreground md:text-sm",
	{
		variants: {
			variant: {
				default:
					"rounded-sm border border-input bg-card px-4 py-2 shadow-sm hover:border-primary/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:border-disabled disabled:bg-disabled aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
				/**
				 * Campo sem caixa, so com a linha de base. Usado nos formularios
				 * longos de projeto, em que a moldura de cada campo competia com a
				 * hierarquia das secoes.
				 *
				 * Foco e erro ficam na propria linha, nunca no anel: um `ring` em
				 * volta de um campo sem moldura desenha uma caixa arredondada do
				 * nada, e o campo focado parecia outro componente ao lado dos
				 * irmaos. A linha e sempre `border-b-2` para a troca de cor no foco
				 * nao deslocar o layout, e usa o mesmo token `ring` que o design
				 * system pede para indicar foco.
				 */
				underline:
					"rounded-none border-0 border-b-2 border-input bg-transparent px-0 py-2 shadow-none hover:border-primary/60 focus-visible:border-ring focus-visible:ring-0 disabled:border-disabled aria-invalid:border-destructive aria-invalid:ring-0",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type InputProps = React.ComponentProps<"input"> &
	VariantProps<typeof inputVariants>;

function Input({ className, type, variant, ...props }: InputProps) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(inputVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Input, inputVariants };
