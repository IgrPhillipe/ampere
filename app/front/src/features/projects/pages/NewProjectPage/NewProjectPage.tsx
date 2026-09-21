import { ControlledInput, ControlledSelect } from "@components/form";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { useZodForm } from "@features/shared";
import type {
	BuildingCategory,
	ConnectionType,
	EntranceStandard,
	SupplyVoltage,
} from "@services/projects";
import { useCreateProject } from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import {
	type ProjectCreationFormValues,
	projectCreationSchema,
} from "../../schemas";

// Os mapas sao `Record<Enum, string>` de proposito: um valor fora do contrato
// ou um caso novo do back sem rotulo aqui quebram o type-check, em vez de
// aparecerem como opcao vazia na tela.
const buildingTypeItems: Record<BuildingCategory, string> = {
	RESIDENTIAL_MULTIFAMILY: "Residencial multifamiliar",
	NON_RESIDENTIAL: "Não residencial",
	MIXED: "Misto",
};

const voltageItems: Record<SupplyVoltage, string> = {
	V220_127: "220/127 V",
	V380_220: "380/220 V",
};

const connectionTypeItems: Record<ConnectionType, string> = {
	SINGLE_PHASE: "Monofásico",
	TWO_PHASE: "Bifásico",
	THREE_PHASE: "Trifásico",
};

const entranceStandardItems: Record<EntranceStandard, string> = {
	COLLECTIVE: "Coletivo",
	INDIVIDUAL: "Individual",
};

const STAGES = [
	"Dados da edificação",
	"Unidades consumidoras",
	"Cálculo de demanda",
	"Memorial",
	"Envio",
];

const PROGRESS_SECTIONS: {
	title: string;
	fields: ReadonlyArray<keyof ProjectCreationFormValues>;
}[] = [
	{
		title: "Identificação",
		fields: ["name", "municipality", "address", "floors"],
	},
	{
		title: "Parâmetros técnicos",
		fields: ["buildingType", "voltage", "connectionType", "entranceStandard"],
	},
];

const pad = (value: number) => String(value).padStart(2, "0");

const isFilled = (value: unknown) =>
	value !== undefined && value !== null && value !== "" && !Number.isNaN(value);

export const NewProjectPage = () => {
	const navigate = useNavigate();
	const createProject = useCreateProject();

	const form = useZodForm(projectCreationSchema, {
		name: "",
		address: "",
		municipality: "",
		buildingType: undefined,
		floors: undefined,
		voltage: undefined,
		connectionType: undefined,
		entranceStandard: undefined,
	});

	const values = form.watch();

	const progress = PROGRESS_SECTIONS.map(({ title, fields }) => ({
		title,
		filled: fields.filter((field) => isFilled(values[field])).length,
		required: fields.length,
	}));

	const totalFilled = progress.reduce((sum, item) => sum + item.filled, 0);
	const totalRequired = progress.reduce((sum, item) => sum + item.required, 0);
	const isComplete = totalFilled === totalRequired;

	const onSubmit = (submitted: ProjectCreationFormValues) => {
		createProject.mutate(submitted, {
			onSuccess: () => {
				void navigate({ to: "/" });
			},
		});
	};

	return (
		<PageLayout
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<form
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-1 flex-col bg-card"
			>
				<div className="px-6 pt-8 md:px-8">
					<p className="text-xs tracking-wider text-muted-foreground uppercase">
						Etapa 01 · Identificação da obra
					</p>

					<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
						Novo projeto
					</h1>
				</div>

				<nav
					aria-label="Etapas do projeto"
					className="mt-6 border-b border-border px-6 md:px-8"
				>
					{/* `overflow-x-auto`: com `hidden` os nomes das etapas eram cortados
					    em largura de celular, sem forma de chegar neles. */}
					<ol className="flex overflow-x-auto">
						{STAGES.map((label, index) => {
							const isCurrent = index === 0;

							return (
								<li
									key={label}
									aria-current={isCurrent ? "step" : undefined}
									className={`flex-1 border-b-2 px-1 py-3 text-sm whitespace-nowrap ${
										isCurrent
											? "border-foreground font-medium text-foreground"
											: "border-transparent text-muted-foreground"
									}`}
								>
									<span className="mr-2 text-xs">{pad(index + 1)}</span>
									{label}
								</li>
							);
						})}
					</ol>
				</nav>

				<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-10 px-6 py-8 md:px-8">
						<section>
							<h2 className="border-b border-foreground pb-3 text-lg font-semibold text-foreground">
								Identificação
							</h2>

							<div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
								<ControlledInput
									control={form.control}
									name="name"
									label="Nome do projeto"
									placeholder="Digite o nome do projeto"
									required
									variant="underline"
								/>

								<ControlledInput
									control={form.control}
									name="municipality"
									label="Município"
									placeholder="Digite o município"
									required
									variant="underline"
								/>

								<ControlledInput
									control={form.control}
									name="address"
									label="Endereço"
									placeholder="Digite o endereço"
									required
									variant="underline"
								/>

								<ControlledInput
									control={form.control}
									name="floors"
									label="Nº de pavimentos"
									type="number"
									min={1}
									max={200}
									step={1}
									inputMode="numeric"
									placeholder="Ex.: 8"
									required
									variant="underline"
								/>
							</div>
						</section>

						<section>
							<h2 className="border-b border-foreground pb-3 text-lg font-semibold text-foreground">
								Parâmetros técnicos
							</h2>

							<div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
								<ControlledSelect
									control={form.control}
									name="buildingType"
									label="Tipo de edificação"
									placeholder="Selecione o tipo de edificação"
									items={buildingTypeItems}
									required
									variant="underline"
								/>

								<ControlledSelect
									control={form.control}
									name="voltage"
									label="Tensão de fornecimento"
									placeholder="Selecione a tensão"
									items={voltageItems}
									required
									variant="underline"
								/>

								<ControlledSelect
									control={form.control}
									name="connectionType"
									label="Tipo de ligação"
									placeholder="Selecione o tipo de ligação"
									items={connectionTypeItems}
									required
									variant="underline"
								/>

								<ControlledSelect
									control={form.control}
									name="entranceStandard"
									label="Padrão de entrada"
									placeholder="Selecione o padrão de entrada"
									items={entranceStandardItems}
									required
									variant="underline"
								/>
							</div>
						</section>
					</div>

					<aside className="space-y-8 border-t border-border px-6 py-8 lg:border-t-0 lg:border-l">
						{/* A norma aplicavel e derivada no back a partir dos parametros
						    (ver `ApplicableStandards`), e so volta na resposta do POST.
						    Ate lá nao ha numero nem revisao para exibir. */}
						<div className="rounded-md border border-border bg-muted/40 p-5">
							<p className="text-xs tracking-wider text-muted-foreground uppercase">
								Norma aplicável
							</p>

							<p className="mt-3 text-sm text-foreground">
								Definida automaticamente ao salvar, a partir do tipo de
								edificação, da tensão e do padrão de entrada informados.
							</p>
						</div>

						<div>
							<h2 className="border-b border-foreground pb-3 text-base font-semibold text-foreground">
								Preenchimento
							</h2>

							<p className="mt-4 flex items-center gap-2 text-3xl font-semibold text-foreground">
								{pad(totalFilled)}/{pad(totalRequired)}
								{isComplete ? (
									<Check aria-hidden="true" className="size-5 text-primary" />
								) : null}
							</p>

							<p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
								Campos obrigatórios preenchidos
							</p>

							<ul className="mt-5 space-y-4">
								{progress.map(({ title, filled, required }) => (
									<li key={title}>
										<div className="flex items-center justify-between text-xs text-foreground">
											<span>{title}</span>

											<span className="text-muted-foreground">
												{pad(filled)}/{pad(required)}
											</span>
										</div>

										<div className="mt-1.5 flex gap-1" aria-hidden="true">
											{Array.from({ length: required }, (_, index) => (
												<span
													key={index}
													className={`h-1 flex-1 ${
														index < filled ? "bg-primary" : "bg-border"
													}`}
												/>
											))}
										</div>
									</li>
								))}
							</ul>
						</div>
					</aside>
				</div>

				<div className="flex items-center justify-between border-t border-border px-6 py-4 md:px-8">
					<Button
						type="button"
						variant="outline"
						size="icon"
						aria-label="Voltar para Meus projetos"
						onClick={() => void navigate({ to: "/" })}
					>
						<ArrowLeft aria-hidden="true" />
					</Button>

					<Button type="submit" disabled={createProject.isPending}>
						{createProject.isPending ? "Salvando..." : "Avançar para unidades"}
						<ArrowRight aria-hidden="true" />
					</Button>
				</div>
			</form>
		</PageLayout>
	);
};
