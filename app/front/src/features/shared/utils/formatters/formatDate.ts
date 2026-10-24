import dayjs from "@lib/dayjs";

export const formatDate = (value: string) => dayjs(value).format("DD/MM/YYYY");

export const formatDateTime = (value: string) =>
	dayjs(value).format("DD/MM/YYYY [às] HH:mm");

export const formatTime = (value: string) => dayjs(value).format("HH:mm");
