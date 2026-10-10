import dayjs from "@lib/dayjs";

export const formatDate = (value: string) => dayjs(value).format("DD/MM/YYYY");

export const formatDateTime = (value: string) =>
	dayjs(value).format("DD/MM/YYYY [às] HH[h]mm");
