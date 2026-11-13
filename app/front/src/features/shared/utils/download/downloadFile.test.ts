import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadFile } from "./downloadFile";

describe("downloadFile", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("saves the blob under its name and then frees the URL", () => {
		vi.useFakeTimers();
		const create = vi.fn(() => "blob:memorial");
		const revoke = vi.fn();
		vi.stubGlobal("URL", {
			...URL,
			createObjectURL: create,
			revokeObjectURL: revoke,
		});
		const click = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(() => undefined);
		const blob = new Blob(["%PDF"], { type: "application/pdf" });

		downloadFile(blob, "memorial-v3.pdf");

		expect(create).toHaveBeenCalledWith(blob);
		expect(click).toHaveBeenCalledOnce();
		const [link] = click.mock.contexts as HTMLAnchorElement[];
		expect(link.download).toBe("memorial-v3.pdf");
		expect(link.href).toBe("blob:memorial");
		expect(revoke).not.toHaveBeenCalled();
		vi.runAllTimers();
		expect(revoke).toHaveBeenCalledWith("blob:memorial");
		vi.unstubAllGlobals();
	});
});
