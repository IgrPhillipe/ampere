import dayjs from "@lib/dayjs";

const TIME_ZONE = "America/Recife";

/** In the utility's time zone, the same one the API counts days in, wherever the browser is. */
export const formatDateTime = (value: string) => {
	const moment = dayjs(value).tz(TIME_ZONE);

	return { date: moment.format("DD/MM/YYYY"), time: moment.format("HH:mm") };
};
