import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRetainedValue } from "./useRetainedValue";

describe("useRetainedValue", () => {
	it("keeps the last value after it is cleared", () => {
		const { result, rerender } = renderHook(
			({ value }: { value: string | null }) => useRetainedValue(value),
			{ initialProps: { value: null as string | null } },
		);

		expect(result.current).toBeNull();

		rerender({ value: "Ana" });
		expect(result.current).toBe("Ana");

		rerender({ value: null });
		expect(result.current).toBe("Ana");

		rerender({ value: "Bruno" });
		expect(result.current).toBe("Bruno");
	});
});
