import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getProjectDetailActions } from "../../constants";
import { ProjectManagementActions } from "./ProjectManagementActions";

const renderFor = (profile: "designer" | "reviewer" | "admin") => {
	const onEdit = vi.fn();
	const onDelete = vi.fn();
	render(
		<ProjectManagementActions
			actions={getProjectDetailActions({ profile, status: "UNDER_REVIEW" })}
			onEdit={onEdit}
			onDelete={onDelete}
		/>,
	);

	return { onEdit, onDelete };
};

describe("ProjectManagementActions", () => {
	it("offers edit and delete to the admin", () => {
		const { onEdit, onDelete } = renderFor("admin");

		fireEvent.click(screen.getByRole("button", { name: "Editar Projeto" }));
		fireEvent.click(screen.getByRole("button", { name: "Excluir Projeto" }));

		expect(onEdit).toHaveBeenCalledOnce();
		expect(onDelete).toHaveBeenCalledOnce();
	});

	it.each([
		"designer",
		"reviewer",
	] as const)("renders nothing for the %s", (profile) => {
		renderFor(profile);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
