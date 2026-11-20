import { apiResponseSchema } from "@features/shared";
import { z } from "zod";

export const notificationTypeSchema = z.enum([
	"PROJECT_APPROVED",
	"PROJECT_REJECTED",
	"FINDING_REOPENED",
	"PROJECT_RESUBMITTED",
	"REVIEW_DEADLINE_NEAR",
	"REVIEW_OVERDUE",
	"APPROVAL_EXPIRING",
]);

export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
	id: z.string(),
	type: notificationTypeSchema,
	protocol: z.string(),
	projectId: z.string(),
	text: z.string(),
	/** A route of the app, such as `/projetos/12/apontamentos`. */
	link: z.string(),
	read: z.boolean(),
	createdAt: z.iso.datetime({ offset: true }),
	readAt: z.iso.datetime({ offset: true }).nullable(),
});

export type AppNotification = z.infer<typeof notificationSchema>;

/** The latest notifications, newest first, and how many are still unread. */
export const notificationListSchema = z.object({
	unreadCount: z.number().int().nonnegative(),
	items: z.array(notificationSchema),
});

export type NotificationList = z.infer<typeof notificationListSchema>;

export const notificationListResponseSchema = apiResponseSchema(
	notificationListSchema,
);

export const notificationResponseSchema = apiResponseSchema(notificationSchema);
