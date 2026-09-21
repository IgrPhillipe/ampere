import { ControlledInput, ControlledSelect } from "@components/form";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { useZodForm } from "@features/shared";
import { useCreateProject } from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import {
	type ProjectCreationFormValues,
	projectCreationSchema,
} from "../../schemas";

const buildingTypeItems = {
	RESIDENTIAL_MULTIFAMILY: "Residencial multifamiliar",
	NON_RESIDENTIAL: "Não residencial",
	MIXED: "Misto",
};

const voltageItems = {
	V220_127: "220/127 V",
	V380_220: "380/220 V",
};

const connectionTypeItems = {
	SINGLE_PHASE: "Monofásico",
	TWO_PHASE: "Bifásico",
	THREE_PHASE: "Trifásico",
};

const entranceStandardItems = {
	COLLECTIVE: "Coletivo",
	INDIVIDUAL: "Individual",
};

const stages = [
	"Dados da edificação",
	"Unidades consumidoras",
	"Cálculo de demanda",
	"Memorial",
	"Envio",
];


const projectInfo = [
	{ label: "Norma aplicada", value: "NDU 001 rev. 5.6" },
	{ label: "Responsável técnico", value: "ART 0812/2026" },
	{ label: "Emissão", value: "01.09.2026" },
];

const progressSections: {
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

const fieldClassName = [
	"[&_label]:text-[10px] [&_label]:font-normal [&_label]:uppercase [&_label]:tracking-wider [&_label]:text-muted-foreground",
	"[&_input]:rounded-none [&_input]:border-0 [&_input]:border-b [&_input]:bg-transparent [&_input]:px-0 [&_input]:shadow-none",
	"[&_button]:rounded-none [&_button]:border-0 [&_button]:border-b [&_button]:bg-transparent [&_button]:px-0 [&_button]:shadow-none",
].join(" ");

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

	const progress = progressSections.map(({ title, fields }) => ({
		title,
		filled: fields.filter((field) => isFilled(values[field])).length,
		required: fields.length,
	}));

	const totalFilled = progress.reduce((sum, item) => sum + item.filled, 0);
	const totalRequired = progress.reduce((sum, item) => sum + item.required, 0);

	const onSubmit = (submitted: ProjectCreationFormValues) => {
		createProject.mutate(submitted, {
			onSuccess: () => {
				void navigate({ to: "/" });
			},
		});
	};

	return (
		<PageLayout
			title=""
			description=""
			className="mx-auto min-h-full w-full max-w-[1600px] pb-0 md:pb-0"
		>
			<form
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-1 flex-col bg-card"
			>
				<dl className="grid gap-4 border-b border-border px-6 py-3 sm:grid-cols-3 md:px-8">
					{projectInfo.map(({ label, value }) => (
						<div key={label}>
							<dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
								{label}
							</dt>
							<dd className="text-sm font-medium text-foreground">{value}</dd>
						</div>
					))}
				</dl>

				<div className="px-6 pt-8 md:px-8">
					<p className="text-[11px] uppercase tracking-wider text-muted-foreground">
						Etapa 01 · Identificação da obra
					</p>

					<h1 className="mt-2 text-4xl font-semibold text-foreground">
						Novo projeto
					</h1>
				</div>

				<nav
					aria-label="Etapas do projeto"
					className="mt-6 border-b border-border px-6 md:px-8"
				>
					<ol className="flex overflow-x-hidden">
						{stages.map((label, index) => {
							const isCurrent = index === 0;

							return (
								<li
									key={label}
									aria-current={isCurrent ? "step" : undefined}
									className={`flex-1 whitespace-nowrap border-b-2 px-1 py-3 text-sm ${
										isCurrent
											? "border-foreground font-medium text-foreground"
											: "border-transparent text-muted-foreground"
									}`}
								>
									<span className="mr-2 text-[10px]">{pad(index + 1)}</span>
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
									label="Nome do projeto *"
									placeholder="Digite o nome do projeto"
									className={fieldClassName}
								/>

								<ControlledInput
									control={form.control}
									name="municipality"
									label="Município *"
									placeholder="Digite o município"
									className={fieldClassName}
								/>

								<ControlledInput
									control={form.control}
									name="address"
									label="Endereço *"
									placeholder="Digite o endereço"
									className={fieldClassName}
								/>

								<ControlledInput
									control={form.control}
									name="floors"
									label="Nº de pavimentos *"
									type="number"
									min={1}
									max={200}
									step={1}
									inputMode="numeric"
									placeholder="Ex.: 8"
									className={fieldClassName}
								/>
							</div>
						</section>

						<section>
							<h2 className="border-b border-foreground pb-3 text-lg font-semibold text-foreground">
								Parâmetros técnicos
							</h2>

							<div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
								<div className={fieldClassName}>
									<ControlledSelect
										control={form.control}
										name="buildingType"
										label="Tipo de edificação *"
										placeholder="Selecione o tipo de edificação"
										items={buildingTypeItems}
									/>
								</div>

								<div className={fieldClassName}>
									<ControlledSelect
										control={form.control}
										name="voltage"
										label="Tensão de fornecimento *"
										placeholder="Selecione a tensão"
										items={voltageItems}
									/>
								</div>

								<div className={fieldClassName}>
									<ControlledSelect
										control={form.control}
										name="connectionType"
										label="Tipo de ligação *"
										placeholder="Selecione o tipo de ligação"
										items={connectionTypeItems}
									/>
								</div>

								<div className={fieldClassName}>
									<ControlledSelect
										control={form.control}
										name="entranceStandard"
										label="Padrão de entrada *"
										placeholder="Selecione o padrão de entrada"
										items={entranceStandardItems}
									/>
								</div>
							</div>
						</section>
					</div>

					<aside className="space-y-8 border-t border-border px-6 py-8 lg:border-l lg:border-t-0">
						<div>
							<div className="bg-primary p-5 text-primary-foreground">
								<p className="border-b border-primary-foreground/40 pb-3 text-[10px] uppercase tracking-wider opacity-80">
									Norma derivada
								</p>

								<p className="mt-3 text-3xl font-semibold">NDU 001</p>

								<p className="mt-1 text-[10px] uppercase tracking-wider opacity-80">
									Revisão 5.6 · Vigente
								</p>
							</div>

							<p className="mt-4 text-sm text-muted-foreground">
								Selecionada automaticamente a partir do tipo de edificação, da
								tensão e do padrão de entrada informados ao lado.
							</p>
						</div>

						<div>
							<h3 className="border-b border-foreground pb-3 text-base font-semibold text-foreground">
								Preenchimento
							</h3>

							<p className="mt-4 flex items-center gap-2 text-3xl font-semibold text-foreground">
								{pad(totalFilled)}/{pad(totalRequired)}
								{totalFilled === totalRequired && (
									<Check aria-hidden="true" className="size-5 text-primary" />
								)}
							</p>

							<p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
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
						aria-label="Voltar"
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
