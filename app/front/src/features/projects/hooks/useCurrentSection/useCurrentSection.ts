import { useMatches } from "@tanstack/react-router";

import { PROJECT_SECTIONS } from "../../constants";

/** Every route outside the tabs, like the index, falls back to the overview. */
export const useCurrentSection = () => {
	const routeId = useMatches({ select: (matches) => matches.at(-1)?.routeId });
	const [overview, ...sections] = PROJECT_SECTIONS;

	return sections.find(({ to }) => to === routeId) ?? overview;
};
