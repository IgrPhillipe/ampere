import dayjs from "@/lib/dayjs";

export const toTime = (date?: string | null) =>
	date ? dayjs(date).format("HH:mm") : "-";
