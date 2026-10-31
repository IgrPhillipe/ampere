import { useAuthStore } from "@features/shared";
import type { ManagedUser } from "@services/users";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";
import { signInAs } from "@/test/fixtures/project-detail";
import { managedUserOf } from "@/test/fixtures/users";

import { UserFormDialog } from "./UserFormDialog";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@services/users", () => ({
	useCreateUser: () => ({ mutate: mockCreate, isPending: false }),
	useUpdateUser: () => ({ mutate: mockUpdate, isPending: false }),
}));

const renderDialog = (user: ManagedUser | null = null) => {
	const onCreated = vi.fn();
	const onOpenChange = vi.fn();
	render(
		<UserFormDialog
			open
			user={user}
			onOpenChange={onOpenChange}
			onCreated={onCreated}
		/>,
	);

	return { onCreated, onOpenChange };
};

const fill = (label: RegExp, value: string) =>
	fireEvent.change(screen.getByLabelText(label), { target: { value } });

const pick = async (option: string) => {
	fireEvent.click(screen.getByRole("combobox", { name: /Papel/ }));
	const item = await screen.findByRole("option", { name: option });
	fireEvent.pointerDown(item);
	fireEvent.click(item);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
};

describe("UserFormDialog", () => {
	beforeEach(() => {
		signInAs("admin");
		mockCreate.mockReset();
		mockUpdate.mockReset();
	});

	afterEach(() => useAuthStore.getState().logout());

	it("asks for name, e-mail and role", async () => {
		renderDialog();

		fireEvent.click(screen.getByRole("button", { name: "Criar Usuário" }));

		expect(
			await screen.findByText("O papel é obrigatório."),
		).toBeInTheDocument();
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it("creates an analyst and hands over the temporary access", async () => {
		const access = {
			user: managedUserOf({ role: "reviewer" }),
			temporaryPassword: "Temp1234",
		};
		mockCreate.mockImplementation((_payload, options) =>
			options.onSuccess({ data: access }),
		);
		const { onCreated, onOpenChange } = renderDialog();

		fill(/^Nome/, "Ana Analista");
		fill(/^E-mail/, "Ana@Ampere.com");
		await pick("Analista");
		fireEvent.click(screen.getByRole("button", { name: "Criar Usuário" }));

		await waitFor(() =>
			expect(mockCreate).toHaveBeenCalledWith(
				{ name: "Ana Analista", email: "ana@ampere.com", role: "reviewer" },
				expect.anything(),
			),
		);
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(onCreated).toHaveBeenCalledWith(access);
	});

	it("shows on the field that the e-mail is taken", async () => {
		const taken = await httpErrorOf(409, {
			detail: "Já existe uma conta com este e-mail.",
		});
		mockCreate.mockImplementation((_payload, options) =>
			options.onError(taken),
		);
		renderDialog();

		fill(/^Nome/, "Ana");
		fill(/^E-mail/, "ana@ampere.com");
		await pick("Projetista");
		fireEvent.click(screen.getByRole("button", { name: "Criar Usuário" }));

		expect(
			await screen.findByText("Já existe uma conta com este e-mail."),
		).toBeInTheDocument();
	});

	it("keeps the status and shows the role conflict on the field", async () => {
		const conflict = await httpErrorOf(409, {
			detail:
				"Este projetista tem projetos em andamento. Conclua-os antes de mudar o papel.",
		});
		mockUpdate.mockImplementation((_params, options) =>
			options.onError(conflict),
		);
		renderDialog(managedUserOf({ active: false }));

		expect(screen.getByLabelText(/^E-mail/)).toBeDisabled();
		await pick("Analista");
		fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }));

		await waitFor(() =>
			expect(mockUpdate).toHaveBeenCalledWith(
				{
					id: "2",
					payload: { name: "Ana Projetista", role: "reviewer", active: false },
				},
				expect.anything(),
			),
		);
		expect(
			await screen.findByText(/tem projetos em andamento/),
		).toBeInTheDocument();
	});

	it("locks the role of the signed-in administrator", () => {
		renderDialog(managedUserOf({ id: "1", role: "admin" }));

		expect(screen.getByRole("combobox", { name: /Papel/ })).toBeDisabled();
		expect(
			screen.getByText(
				"Você não pode remover o próprio papel de administrador.",
			),
		).toBeInTheDocument();
	});
});
