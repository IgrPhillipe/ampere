import type {
	ConsumerUnitGroup,
	GroupStatus,
	GroupValidation,
	LoadItem,
	ValidationIssue,
} from "../schemas";
import type { ConsumerUnitGroupPayload } from "../types";

/**
 * Espelho das regras de validacao do dominio do back (`ResidentialGroup`,
 * `LoadGroup`, `LoadCategory`, `EvChargingGroup`), mensagens inclusive. So
 * existe para a tela reagir com o MSW ligado; a regra de verdade e a do back.
 */
const KW_PER_UNIT = { KW: 1, CV: 0.7355, HP: 0.7457 } as const;
const LARGEST_TABULATED_AREA = 1000;
const LARGE_MOTOR_CV = 5;
const INCORPORATED_STATION_KW = 3.3;

const decimal = (value: number) =>
	new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);

const isPositive = (value: number | null | undefined): value is number =>
	typeof value === "number" && value > 0;

const missing = (field: string, message: string): ValidationIssue => ({
	severity: "MISSING_DATA",
	field,
	message,
});

const review = (field: string, message: string): ValidationIssue => ({
	severity: "REVIEW",
	field,
	message,
});

const itemLoadKw = (item: LoadItem) =>
	isPositive(item.power)
		? item.power * KW_PER_UNIT[item.powerUnit] * item.quantity
		: 0;

const itemIssues = (
	item: LoadItem,
	path: string,
	usage: ConsumerUnitGroupPayload["usage"],
): ValidationIssue[] => {
	if (!isPositive(item.power)) {
		return [
			missing(
				`${path}.power`,
				`Informe a potência de placa de "${item.description}".`,
			),
		];
	}

	if (
		item.category === "LIGHTING_AND_OUTLETS" &&
		usage === "COMMERCIAL" &&
		!item.lampTechnology
	) {
		return [
			missing(
				`${path}.lampTechnology`,
				`Informe a tecnologia das lâmpadas de "${item.description}". Ela define o fator de potência da iluminação.`,
			),
		];
	}

	const powerInCv = (item.power * KW_PER_UNIT[item.powerUnit]) / KW_PER_UNIT.CV;

	if (
		item.category === "MOTORS" &&
		powerInCv > LARGE_MOTOR_CV &&
		item.simultaneousStart == null
	) {
		return [
			review(
				`${path}.simultaneousStart`,
				`${item.description} declarado com ${decimal(item.power)} ${item.powerUnit === "KW" ? "kW" : item.powerUnit}. Motores acima de 5 CV entram com fator de partida próprio: informe se a partida é simultânea.`,
			),
		];
	}

	return [];
};

const statusOf = (issues: ValidationIssue[]): GroupStatus => {
	if (issues.some(({ severity }) => severity === "MISSING_DATA")) {
		return "MISSING_DATA";
	}

	return issues.length > 0 ? "REVIEW" : "VALIDATED";
};

export const makeGroup = (
	id: string,
	payload: ConsumerUnitGroupPayload,
): ConsumerUnitGroup => {
	const base = { id, name: payload.name, quantity: payload.quantity };

	if (payload.kind === "RESIDENTIAL") {
		const issues: ValidationIssue[] = [];

		if (!isPositive(payload.usefulArea)) {
			issues.push(
				missing(
					"usefulArea",
					"Informe a área útil. Ela define a demanda de cada unidade.",
				),
			);
		} else if (payload.usefulArea > LARGEST_TABULATED_AREA) {
			issues.push(
				review(
					"usefulArea",
					`Área útil de ${decimal(payload.usefulArea)} m² passa da última faixa do Quadro 35 (1.000 m²): confirme o valor.`,
				),
			);
		}

		if (!isPositive(payload.unitLoadKw)) {
			issues.push(
				missing(
					"unitLoadKw",
					"Informe a carga instalada por unidade, usada no cálculo individual do item 6.22.3.",
				),
			);
		}

		const loadPerUnitKw = isPositive(payload.unitLoadKw)
			? payload.unitLoadKw
			: null;
		const summary = [
			isPositive(payload.usefulArea)
				? `${decimal(payload.usefulArea)} m²`
				: "Área útil não informada",
			payload.bedrooms != null
				? `${payload.bedrooms} ${payload.bedrooms === 1 ? "quarto" : "quartos"}`
				: null,
			"DIS-NOR-053 Quadro 35",
		]
			.filter(Boolean)
			.join(" · ");

		return {
			...base,
			kind: "RESIDENTIAL",
			usefulArea: payload.usefulArea,
			bedrooms: payload.bedrooms,
			unitLoadKw: payload.unitLoadKw,
			compactUnit: payload.compactUnit ?? false,
			status: statusOf(issues),
			issues,
			summary,
			loadPerUnitKw,
			declaredLoadKw: (loadPerUnitKw ?? 0) * payload.quantity,
		};
	}

	if (payload.kind === "LOAD") {
		const items: LoadItem[] = (payload.items ?? []).map((item) => ({
			...item,
		}));
		const issues: ValidationIssue[] = [];

		if (!payload.usage) {
			issues.push(
				missing(
					"usage",
					"Informe se a carga é de área comum ou de unidade comercial.",
				),
			);
		}

		if (items.length === 0) {
			issues.push(
				missing(
					"items",
					"Informe as cargas instaladas: iluminação, motores, bombas e demais.",
				),
			);
		}

		items.forEach((item, index) => {
			issues.push(...itemIssues(item, `items[${index}]`, payload.usage));
		});

		const loadPerUnitKw =
			items.length === 0
				? null
				: items.reduce((sum, item) => sum + itemLoadKw(item), 0);
		const listed = items
			.slice(0, 3)
			.map(({ description }) => description)
			.join(", ");
		const loads =
			items.length === 0
				? "Nenhuma carga informada"
				: items.length > 3
					? `${listed} e mais ${items.length - 3}`
					: listed;

		return {
			...base,
			kind: "LOAD",
			usage: payload.usage,
			items,
			status: statusOf(issues),
			issues,
			summary: `${loads} · DIS-NOR-030 item 6.27`,
			loadPerUnitKw,
			declaredLoadKw: (loadPerUnitKw ?? 0) * payload.quantity,
		};
	}

	const issues: ValidationIssue[] = [];

	if (payload.loadManagement == null) {
		issues.push(
			missing(
				"loadManagement",
				"Informe se há sistema de gerenciamento de carga. Sem isso o fator de simultaneidade não pode ser aplicado.",
			),
		);
	}

	if (!isPositive(payload.powerPerPointKw) && !payload.incorporatedInVehicle) {
		issues.push(
			missing(
				"powerPerPointKw",
				"Informe a potência de placa de cada ponto. O valor padrão de 3,3 kW vale só para estação incorporada ao veículo.",
			),
		);
	}

	if (!payload.stationType) {
		issues.push(
			missing(
				"stationType",
				"Informe se os pontos são individualizados por unidade ou coletivos.",
			),
		);
	}

	const loadPerUnitKw = isPositive(payload.powerPerPointKw)
		? payload.powerPerPointKw
		: payload.incorporatedInVehicle
			? INCORPORATED_STATION_KW
			: null;
	const points = `${payload.quantity} ${payload.quantity === 1 ? "ponto" : "pontos"}`;

	return {
		...base,
		kind: "EV_CHARGING",
		powerPerPointKw: payload.powerPerPointKw,
		incorporatedInVehicle: payload.incorporatedInVehicle,
		loadManagement: payload.loadManagement,
		stationType: payload.stationType,
		status: statusOf(issues),
		issues,
		summary: `${loadPerUnitKw == null ? `${points}, potência não informada` : `${points} de ${decimal(loadPerUnitKw)} kW`} · DIS-NOR-053 Quadro 33`,
		loadPerUnitKw,
		declaredLoadKw: (loadPerUnitKw ?? 0) * payload.quantity,
	};
};

export const makeGroupValidation = (
	groups: ConsumerUnitGroup[],
): GroupValidation => {
	const pendingCount = groups.reduce(
		(sum, { issues }) => sum + issues.length,
		0,
	);

	return {
		canCalculate: groups.length > 0 && pendingCount === 0,
		pendingCount,
		totalGroups: groups.length,
		totalUnits: groups.reduce((sum, { quantity }) => sum + quantity, 0),
		totalDeclaredLoadKw: groups.reduce(
			(sum, { declaredLoadKw }) => sum + declaredLoadKw,
			0,
		),
	};
};
