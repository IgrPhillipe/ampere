import { ControlledInput, FormActions } from "@components/form";
import { Button } from "@components/ui/button";
import { AuthLayout } from "@features/auth";
import { useZodForm } from "@features/shared";
import {
	useVerifyMemorial,
	type VerifyMemorialInput,
} from "@services/project-versions";
import { FileUp } from "lucide-react";
import { useEffect, useRef } from "react";

import { VerificationResult } from "../../components";
import {
	normalizeVerificationCode,
	type VerificationCodeValues,
	verificationCodeSchema,
} from "../../schemas";

interface VerifyAuthenticityPageProps {
	/** From `?codigo=`: the version list links here with the code filled in. */
	initialCode?: string;
}

const checkedLabel = (input: VerifyMemorialInput) =>
	input.by === "code" ? `Código ${input.code}` : `Arquivo ${input.file.name}`;

/** Public: anyone holding a memorial checks it against the registered versions. */
export const VerifyAuthenticityPage = ({
	initialCode = "",
}: VerifyAuthenticityPageProps) => {
	const form = useZodForm(verificationCodeSchema, { code: initialCode });
	const fileInput = useRef<HTMLInputElement>(null);
	const verify = useVerifyMemorial();

	const verifyCode = ({ code }: VerificationCodeValues) =>
		verify.mutate({ by: "code", code: normalizeVerificationCode(code) });

	// A code that fails validation hides the answer about the previous one.
	const submitCode = form.handleSubmit(verifyCode, () => verify.reset());

	const verifyFile = (file: File | undefined) => {
		if (!file) return;

		verify.mutate({ by: "file", file });
		// The same file can be picked again after it changes on disk.
		if (fileInput.current) fileInput.current.value = "";
	};

	// A link with the code checks it at once.
	const autoChecked = useRef(false);
	useEffect(() => {
		if (autoChecked.current || !initialCode) return;
		autoChecked.current = true;
		void submitCode();
	}, [initialCode, submitCode]);

	return (
		<AuthLayout
			eyebrow="Memorial descritivo"
			title="Verificar Autenticidade"
			description="Confira se um memorial é o mesmo emitido no envio do projeto, pelo código do rodapé ou pelo próprio PDF."
			note="Qualquer alteração no arquivo muda a impressão digital do PDF, e a verificação falha. Não é preciso entrar no portal."
		>
			<form noValidate onSubmit={submitCode} className="flex flex-col gap-5">
				<ControlledInput
					control={form.control}
					name="code"
					label="Código de Verificação"
					placeholder="7F3A-91C2-04BD-2E77"
					autoComplete="off"
					spellCheck={false}
					className="font-mono uppercase"
				/>

				<FormActions align="start">
					<Button type="submit" disabled={verify.isPending}>
						{verify.isPending ? "Verificando..." : "Verificar Código"}
					</Button>

					<Button
						type="button"
						variant="outline"
						disabled={verify.isPending}
						onClick={() => fileInput.current?.click()}
					>
						<FileUp aria-hidden="true" />
						Enviar o PDF
					</Button>
					<input
						ref={fileInput}
						type="file"
						accept="application/pdf,.pdf"
						className="sr-only"
						tabIndex={-1}
						aria-label="PDF do memorial"
						onChange={(event) => verifyFile(event.target.files?.[0])}
					/>
				</FormActions>
			</form>

			{verify.data && verify.variables ? (
				<div className="flex flex-col gap-2">
					<p className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
						{checkedLabel(verify.variables)}
					</p>
					<VerificationResult result={verify.data.data} />
				</div>
			) : null}
		</AuthLayout>
	);
};
