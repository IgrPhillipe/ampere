package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

class NotificationSchedulerTest {

  private static final String DAILY = "0 0 6 * * *";

  private final NotificationService service = mock(NotificationService.class);

  @Test
  void theStartupCatchesUpTheSweep() {
    new NotificationScheduler(service, DAILY).catchUp();

    verify(service).issueTimeBasedNotifications(any());
  }

  @Test
  void aDisabledCronAlsoDisablesTheCatchUp() {
    new NotificationScheduler(service, "-").catchUp();

    verify(service, never()).issueTimeBasedNotifications(any());
  }

  @Test
  void aFailedCatchUpDoesNotStopTheBoot() {
    when(service.issueTimeBasedNotifications(any())).thenThrow(new IllegalStateException("db"));

    assertThatCode(new NotificationScheduler(service, DAILY)::catchUp).doesNotThrowAnyException();
  }
}
