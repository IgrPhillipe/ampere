package br.com.ampere.dto;

import br.com.ampere.service.NotificationListing;
import java.util.List;

public record NotificationListResponse(long unreadCount, List<NotificationResponse> items) {

  public static NotificationListResponse from(NotificationListing listing) {
    return new NotificationListResponse(
        listing.unreadCount(), listing.items().stream().map(NotificationResponse::from).toList());
  }
}
