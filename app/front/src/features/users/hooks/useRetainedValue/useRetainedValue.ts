import { useState } from "react";

/** Keeps the last non-null value, so a closing dialog keeps its content through the exit animation. */
export const useRetainedValue = <T>(value: T | null) => {
	const [retained, setRetained] = useState(value);

	if (value !== null && value !== retained) setRetained(value);

	return value ?? retained;
};
