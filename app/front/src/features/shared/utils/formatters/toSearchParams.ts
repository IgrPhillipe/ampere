export const toSearchParams = (
	obj: Record<string, unknown>,
): URLSearchParams => {
	const searchParams = new URLSearchParams();

	Object.entries(obj).forEach(([key, value]) => {
		if (value === undefined || value === null) return;

		if (Array.isArray(value)) {
			value.forEach((v) => {
				if (v !== undefined && v !== null) {
					searchParams.append(key, String(v));
				}
			});
		} else {
			searchParams.set(key, String(value));
		}
	});

	return searchParams;
};
