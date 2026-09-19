export const parseBRLInput = (value?: string | number): string => {
	const numeric = Number(String(value).replace(/\D/g, ""));

	if (isNaN(numeric)) return "";

	return (numeric / 100).toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};
