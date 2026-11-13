package br.com.ampere.service;

import br.com.ampere.utils.Timestamps;
import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {

  private static final Logger LOGGER = LoggerFactory.getLogger(NotificationScheduler.class);
  private static final String DISABLED = "-";

  private final NotificationService service;
  private final ApprovalExpiryService expiry;
  private final String cron;

  public NotificationScheduler(
      NotificationService service,
      ApprovalExpiryService expiry,
      @Value("${ampere.notifications.cron}") String cron) {
    this.service = service;
    this.expiry = expiry;
    this.cron = cron;
  }

  /** The daily sweep: expires the approvals past their validity, then issues the warnings. */
  @Scheduled(cron = "${ampere.notifications.cron}", zone = Timestamps.ZONE_ID)
  public void sweep() {
    OffsetDateTime now = Timestamps.now();
    int expired = expiry.expireApprovals(now);
    LOGGER.info("Approvals expired: {}", expired);
    int issued = service.issueTimeBasedNotifications(now);
    LOGGER.info("Deadline and validity notifications issued: {}", issued);
  }

  // An API that was down at the scheduled time catches up here; a failure must not stop the boot.
  @EventListener(ApplicationReadyEvent.class)
  public void catchUp() {
    if (DISABLED.equals(cron)) {
      return;
    }
    try {
      sweep();
    } catch (RuntimeException failure) {
      LOGGER.warn("Notification sweep failed on startup: {}", failure.getMessage());
    }
  }
}
