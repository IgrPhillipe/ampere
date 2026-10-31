import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import type { TemporaryAccess } from "@services/users";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface TemporaryPasswordDialogProps {
	/** Lives only in this state: the password is never cached nor shown again. */
	access: TemporaryAccess | null;
	onClose: () => void;
}

export const TemporaryPasswordDialog = ({
	access,
	onClose,
}: TemporaryPasswordDialogProps) => {
	const copyPassword = async () => {
		if (!access) return;

		try {
			await navigator.clipboard.writeText(access.temporaryPassword);
			toast.success("Senha copiada.");
		} catch {
			toast.error(
				"Não foi possível copiar a senha. Selecione e copie o texto.",
			);
		}
	};

	return (
		// Only "Concluir" closes it, so a stray click or Esc does not lose the password.
		<Dialog open={access !== null}>
			<DialogContent className="bg-card sm:max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="font-heading text-xl">
						Senha Temporária
					</DialogTitle>

					<DialogDescription>
						Repasse esta senha a {access?.user.name} ({access?.user.email}). Ela
						não será exibida novamente, e a troca é obrigatória no próximo
						login.
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-hover px-4 py-3">
					<p className="min-w-0">
						<span className="sr-only">Senha temporária: </span>
						<code className="font-mono text-lg font-semibold tracking-wide break-all text-foreground select-all">
							{access?.temporaryPassword}
						</code>
					</p>

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => void copyPassword()}
					>
						<Copy aria-hidden="true" />
						Copiar Senha
					</Button>
				</div>

				<DialogFooter className="mt-2">
					<Button type="button" onClick={onClose}>
						Concluir
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
