import dayjs from "@/lib/dayjs";

export const toDateTime = (date?: string | null) =>
	date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-";
