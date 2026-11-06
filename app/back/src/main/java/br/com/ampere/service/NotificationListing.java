package br.com.ampere.service;

import br.com.ampere.domain.Notification;
import java.util.List;

/** The newest notifications of a user and how many of all of them are still unread. */
public record NotificationListing(List<Notification> items, long unreadCount) {}
