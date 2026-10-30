export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload {
	name: string;
	email: string;
	password: string;
	crea: string;
	creaState: string;
	company?: string;
	phone: string;
}
