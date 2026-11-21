import { FormField } from "@components/form";
import { FieldControl } from "@components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import { useGetReviewerList } from "@services/review-queue";
import { type Control, Controller } from "react-hook-form";

import type { ProjectCreationFormValues } from "../../schemas";

/** Stands for "no analyst yet": the Select needs a value for the option. */
const NO_REVIEWER = "none";

interface ProjectReviewerFieldProps {
	control: Control<ProjectCreationFormValues>;
}

/** The administrator may pick the analyst ahead: they get the project on submission. */
export const ProjectReviewerField = ({
	control,
}: ProjectReviewerFieldProps) => {
	const reviewersQuery = useGetReviewerList();
	const reviewers = (reviewersQuery.data?.data ?? []).filter(
		({ active }) => active,
	);
	// The record only resolves the chosen label; the list below keeps the API's order by name.
	const items = Object.fromEntries([
		[NO_REVIEWER, "Definir depois"],
		...reviewers.map(({ id, name }) => [id, name]),
	]);

	return (
		<Controller
			control={control}
			name="reviewerId"
			render={({ field, fieldState }) => (
				<FormField
					label="Analista (opcional)"
					description="Recebe o projeto no envio. Sem analista, a atribuição fica para depois."
					error={fieldState.error?.message}
				>
					<Select
						items={items}
						value={field.value ?? NO_REVIEWER}
						onValueChange={(value) =>
							field.onChange(
								value === NO_REVIEWER || value === null ? undefined : value,
							)
						}
						disabled={reviewersQuery.isPending}
					>
						<FieldControl
							render={
								<SelectTrigger variant="underline">
									<SelectValue className="min-w-0 truncate" />
								</SelectTrigger>
							}
							name={field.name}
							onBlur={field.onBlur}
							ref={field.ref}
						/>

						<SelectContent>
							<SelectItem value={NO_REVIEWER}>Definir depois</SelectItem>
							{reviewers.map(({ id, name }) => (
								<SelectItem key={id} value={id}>
									{name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
			)}
		/>
	);
};
