package br.com.ampere.service;

import br.com.ampere.domain.Notification;
import java.util.List;

public record NotificationListing(List<Notification> items, long unreadCount) {}
