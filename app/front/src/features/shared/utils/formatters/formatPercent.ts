export const formatPercent = (value: number) =>
	`${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
