package br.com.ampere.repository;

import br.com.ampere.domain.Notification;
import br.com.ampere.domain.NotificationType;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

  List<Notification> findAllByRecipientIdOrderByCreatedAtDescIdDesc(
      Long recipientId, Pageable pageable);

  List<Notification> findAllByProjectId(Long projectId);

  long countByRecipientIdAndReadAtIsNull(Long recipientId);

  boolean existsByRecipientIdAndProjectIdAndTypeAndReviewCycle(
      Long recipientId, Long projectId, NotificationType type, int reviewCycle);

  @Modifying(flushAutomatically = true, clearAutomatically = true)
  @Query(
      """
      UPDATE Notification notification
      SET notification.readAt = :readAt
      WHERE notification.recipient.id = :recipientId AND notification.readAt IS NULL
      """)
  int markAllRead(@Param("recipientId") Long recipientId, @Param("readAt") OffsetDateTime readAt);

  @Modifying(flushAutomatically = true, clearAutomatically = true)
  @Query(
      """
      UPDATE Notification notification
      SET notification.readAt = :readAt
      WHERE notification.project.id IN :projectIds
        AND notification.type = :type
        AND notification.readAt IS NULL
      """)
  int markReadByProjects(
      @Param("projectIds") Collection<Long> projectIds,
      @Param("type") NotificationType type,
      @Param("readAt") OffsetDateTime readAt);

  @Modifying(flushAutomatically = true)
  @Query(
      """
      UPDATE Notification notification
      SET notification.link = :link
      WHERE notification.recipient.id = :recipientId AND notification.project.id = :projectId
      """)
  int relink(
      @Param("recipientId") Long recipientId,
      @Param("projectId") Long projectId,
      @Param("link") String link);
}
