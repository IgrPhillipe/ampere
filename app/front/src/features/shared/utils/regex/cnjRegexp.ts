export const cnjRegexp = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

export const isValidCNJ = (value: string): boolean => cnjRegexp.test(value);
