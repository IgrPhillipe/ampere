import dayjs from "@lib/dayjs";

export const formatDate = (value: string) => dayjs(value).format("DD/MM/YYYY");
