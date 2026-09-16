import type { ChangeEvent } from "react";

import { parseCents, parseNumber } from "@/features/shared/utils/parser";

import { toBRL, toPercentage } from "./index";

export type MaskType = "letters" | "numbers" | "both";
export type MaskFormatterOptions = {
	event?: ChangeEvent<HTMLInputElement>;
	maskType?: MaskType;
	intlOptions?: Intl.NumberFormatOptions;
};

export type MaskFormatter = (
	value: string,
	options: MaskFormatterOptions,
) => string;

const MASK_REGEX = {
	letters: /[^a-zA-Z]+/g,
	numbers: /\D+/g,
	both: /[^a-zA-Z0-9]+/g,
};

const applyMask = (
	value: string | number,
	mask: string,
	maskType: MaskType = "numbers",
): string => {
	if (!value) return "";

	const regex = MASK_REGEX[maskType];
	const unmaskedValue = String(value).replace(regex, "");

	let formattedValue = "";
	let position = 0;

	for (let i = 0; i < mask.length; i++) {
		if (mask[i] === "*" && unmaskedValue[position] !== undefined) {
			formattedValue += unmaskedValue[position++];
		} else if (unmaskedValue[position] !== undefined) {
			formattedValue += mask[i];
		}
	}

	return formattedValue;
};

const maskCPF = "***.***.***-**";
const maskCNPJ = "**.***.***/****-**";
const maskCEP = "*****-***";
const maskCNJ = "*******-**.****.*.**.****";
const maskPhone10 = "(**) ****-****";
const maskPhone11 = "(**) *****-****";
const maskUUID = "********-****-****-****-************";

export const formatCPF: MaskFormatter = (value, options) =>
	applyMask(value, maskCPF, options?.maskType);

export const formatCNPJ: MaskFormatter = (value, options) =>
	applyMask(value, maskCNPJ, options?.maskType);

export const formatCEP: MaskFormatter = (value, options) =>
	applyMask(value, maskCEP, options?.maskType);

export const formatPhone: MaskFormatter = (value) => {
	const digits = value.replace(/\D/g, "").slice(0, 11);

	if (digits.length <= 10) {
		return applyMask(digits, maskPhone10, "numbers");
	}
	return applyMask(digits, maskPhone11, "numbers");
};

export const formatCNJ: MaskFormatter = (value) => {
	const digits = value.replace(/\D/g, "").slice(0, 20);
	return applyMask(digits, maskCNJ, "numbers");
};

export const formatBRL: MaskFormatter = (value, { intlOptions }) => {
	const numeric = parseCents(value);

	if (isNaN(numeric)) return "";

	return toBRL(numeric, intlOptions);
};

export const formatPercentage: MaskFormatter = (
	value,
	{ event, intlOptions },
) => {
	const isDeleting =
		(event?.nativeEvent as InputEvent)?.inputType === "deleteContentBackward";

	if (!value || (isDeleting && value.length === 1)) {
		return "";
	}

	const parsedValue =
		parseNumber(isDeleting ? value.slice(0, -1) : value) / 100;

	return toPercentage(parsedValue, intlOptions);
};

export const formatUUID: MaskFormatter = (value) =>
	applyMask(value, maskUUID, "both");

export const toMask = {
	cpf: formatCPF,
	cnpj: formatCNPJ,
	cep: formatCEP,
	brl: formatBRL,
	percentage: formatPercentage,
	phone: formatPhone,
	cnj: formatCNJ,
	uuid: formatUUID,
};
