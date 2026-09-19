import { zodResolver } from "@hookform/resolvers/zod";
import type {
	DefaultValues,
	FieldValues,
	Resolver,
	UseFormReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export const useZodForm = <TValues extends FieldValues>(
	schema: z.ZodType<TValues>,
	defaultValues?: Partial<TValues>,
): UseFormReturn<TValues> =>
	useForm<TValues>({
		resolver: zodResolver(
			schema as unknown as Parameters<typeof zodResolver>[0],
		) as Resolver<TValues>,
		defaultValues: defaultValues as DefaultValues<TValues>,
	});
