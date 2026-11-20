import { padCount } from "@features/shared";

export const formatVersion = (number: number) => `v${padCount(number)}`;
