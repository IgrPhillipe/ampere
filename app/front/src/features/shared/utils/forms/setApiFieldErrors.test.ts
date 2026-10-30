import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { setApiFieldErrors } from "./setApiFieldErrors";

const renderForm = () =>
	renderHook(() =>
		useForm({ defaultValues: { email: "", crea: "", phone: "" } }),
	).result;

describe("setApiFieldErrors", () => {
	it("puts each bean validation error on its field", async () => {
		const form = renderForm();
		const error = await httpErrorOf(400, {
			detail: "Verifique os dados enviados.",
			errors: [
				{ field: "crea", defaultMessage: "Informe só o número do CREA." },
				{ field: "unknown", defaultMessage: "Fora do formulário." },
			],
		});

		let applied = false;
		act(() => {
			applied = setApiFieldErrors(form.current, error);
		});

		expect(applied).toBe(true);
		expect(form.current.getFieldState("crea").error?.message).toBe(
			"Informe só o número do CREA.",
		);
	});

	it("puts a whole status on the given field", async () => {
		const form = renderForm();
		const error = await httpErrorOf(409, {
			detail: "Já existe uma conta com este e-mail.",
		});

		act(() => {
			setApiFieldErrors(form.current, error, { 409: "email" });
		});

		expect(form.current.getFieldState("email").error?.message).toBe(
			"Já existe uma conta com este e-mail.",
		);
	});

	it("leaves the form alone when the error has no field", async () => {
		const form = renderForm();
		const error = await httpErrorOf(400, { detail: "Erro geral." });

		let applied = true;
		act(() => {
			applied = setApiFieldErrors(form.current, error, { 409: "email" });
		});

		expect(applied).toBe(false);
	});
});
