import { parseAsInteger, useQueryStates } from "nuqs";

/** The pair under comparison lives in the URL, so it can be shared and reloaded. */
export const useComparedVersions = () => {
	const [query, setQuery] = useQueryStates({
		de: parseAsInteger,
		para: parseAsInteger,
	});

	const compared =
		query.de !== null && query.para !== null && query.de !== query.para
			? { from: query.de, to: query.para }
			: null;

	return {
		compared,
		compare: ({ from, to }: { from: number; to: number }) =>
			void setQuery({ de: from, para: to }),
		close: () => void setQuery({ de: null, para: null }),
	};
};
