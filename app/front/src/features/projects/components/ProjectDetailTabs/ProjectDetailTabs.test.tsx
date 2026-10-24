import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectDetailTabs } from "./ProjectDetailTabs";

describe("ProjectDetailTabs", () => {
	it("offers a retry instead of an endless skeleton when the calculation fails", () => {
		const onRetry = vi.fn();
		render(
			<ProjectDetailTabs
				projectId="4"
				totalLoadKw={0}
				failed={{ calculation: true }}
				onRetry={onRetry}
				onOpenGroup={vi.fn()}
			/>,
		);

		expect(
			screen.getByText("Não foi possível carregar o cálculo"),
		).toBeVisible();
		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));
		expect(onRetry).toHaveBeenCalledOnce();
	});
});
