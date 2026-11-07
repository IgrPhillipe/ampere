package br.com.ampere.dto;

import br.com.ampere.domain.Notification;
import br.com.ampere.domain.NotificationType;
import java.time.OffsetDateTime;

public record NotificationResponse(
    String id,
    NotificationType type,
    String protocol,
    String projectId,
    String text,
    String link,
    boolean read,
    OffsetDateTime createdAt,
    OffsetDateTime readAt) {

  public static NotificationResponse from(Notification notification) {
    return new NotificationResponse(
        String.valueOf(notification.getId()),
        notification.getType(),
        notification.getProtocol(),
        String.valueOf(notification.getProject().getId()),
        notification.getText(),
        notification.getLink(),
        notification.isRead(),
        notification.getCreatedAt(),
        notification.getReadAt());
  }
}
