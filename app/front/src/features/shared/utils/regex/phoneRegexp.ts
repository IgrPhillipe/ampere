export const phoneRegexp = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;

export const isValidPhone = (value: string): boolean => phoneRegexp.test(value);
