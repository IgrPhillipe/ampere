import dayjs from "@/lib/dayjs";

export const toDate = (date?: string | null) =>
	date ? dayjs(date).format("DD/MM/YYYY") : "-";
