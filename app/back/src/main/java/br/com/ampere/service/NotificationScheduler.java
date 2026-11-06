package br.com.ampere.service;

import br.com.ampere.utils.Timestamps;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Daily sweep for the notifications that no user action triggers. */
@Component
public class NotificationScheduler {

  private static final Logger LOGGER = LoggerFactory.getLogger(NotificationScheduler.class);

  private final NotificationService service;

  public NotificationScheduler(NotificationService service) {
    this.service = service;
  }

  /** "-" disables it (the tests); the default is 06:00 in the concessionaire's calendar. */
  @Scheduled(cron = "${ampere.notifications.cron:0 0 6 * * *}", zone = "America/Recife")
  public void sweep() {
    int issued = service.issueTimeBasedNotifications(Timestamps.now());
    LOGGER.info("Deadline and validity notifications issued: {}", issued);
  }
}
