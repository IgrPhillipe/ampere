package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

class NotificationSchedulerTest {

  private static final String DAILY = "0 0 6 * * *";

  private final NotificationService service = mock(NotificationService.class);

  private final ApprovalExpiryService expiry = mock(ApprovalExpiryService.class);

  @Test
  void theStartupCatchesUpTheSweep() {
    new NotificationScheduler(service, expiry, DAILY).catchUp();

    verify(expiry).expireApprovals(any());
    verify(service).issueTimeBasedNotifications(any());
  }

  @Test
  void theSweepExpiresTheApprovalsBeforeTheWarnings() {
    new NotificationScheduler(service, expiry, DAILY).sweep();

    InOrder order = inOrder(expiry, service);
    order.verify(expiry).expireApprovals(any());
    order.verify(service).issueTimeBasedNotifications(any());
  }

  @Test
  void aDisabledCronAlsoDisablesTheCatchUp() {
    new NotificationScheduler(service, expiry, "-").catchUp();

    verify(expiry, never()).expireApprovals(any());
    verify(service, never()).issueTimeBasedNotifications(any());
  }

  @Test
  void aFailedCatchUpDoesNotStopTheBoot() {
    when(service.issueTimeBasedNotifications(any())).thenThrow(new IllegalStateException("db"));

    assertThatCode(new NotificationScheduler(service, expiry, DAILY)::catchUp)
        .doesNotThrowAnyException();
  }
}
