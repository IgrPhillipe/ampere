export const parseCents = (value: string): number =>
	Number(
		String(value).replace(/\./g, "").replace(",", ".").replace(/\D/g, ""),
	) / 100;
