/** Nome do produto, como aparece na aba e nos compartilhamentos. */
export const APP_NAME = "AMPERE";

/**
 * Titulo da aba, num formato so.
 *
 * O nome do produto vem por ultimo porque a aba encolhe pela direita quando
 * ha muitas abertas: o que identifica a tela precisa sobrar. Sem argumento,
 * devolve so o nome — e o caso da raiz, que serve de padrao para qualquer
 * rota que ainda nao declare o proprio `head`.
 */
export const pageTitle = (title?: string) =>
	title ? `${title} | ${APP_NAME}` : APP_NAME;
