package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.Objects;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/** A notice for one user about a project, shown in the header bell. */
@Entity
@Table(
    name = "notification",
    indexes = {
      @Index(name = "idx_notification_recipient", columnList = "recipient_id, created_at, id"),
      @Index(name = "idx_notification_dedup", columnList = "project_id, type, review_cycle")
    })
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "recipient_id", nullable = false, updatable = false)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private User recipient;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false, updatable = false)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Project project;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, updatable = false)
  private NotificationType type;

  /** Kept on the notice: the protocol is what the panel shows next to the text. */
  @Column(nullable = false, updatable = false)
  private String protocol;

  @Column(nullable = false, updatable = false)
  private String text;

  /** Front-end route the notification opens. */
  @Column(nullable = false, updatable = false)
  private String link;

  /**
   * Review cycle of the project when the notice was issued; a deadline notice is once per cycle.
   */
  @Column(nullable = false, updatable = false)
  private int reviewCycle;

  @Column(nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  private OffsetDateTime readAt;

  protected Notification() {}

  public Notification(
      User recipient,
      Project project,
      NotificationType type,
      String text,
      String link,
      OffsetDateTime createdAt) {
    this.recipient = Objects.requireNonNull(recipient, "recipient");
    this.project = Objects.requireNonNull(project, "project");
    this.type = Objects.requireNonNull(type, "type");
    this.protocol = project.getProtocol();
    this.text = Objects.requireNonNull(text, "text");
    this.link = Objects.requireNonNull(link, "link");
    this.reviewCycle = project.getReviewCycle();
    this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
  }

  public boolean isRead() {
    return readAt != null;
  }

  /** Reading twice keeps the first reading. */
  public void markRead(OffsetDateTime at) {
    if (readAt == null) {
      readAt = Objects.requireNonNull(at, "at");
    }
  }

  public boolean isOwnedBy(Long userId) {
    return recipient.getId().equals(userId);
  }

  public Long getId() {
    return id;
  }

  public User getRecipient() {
    return recipient;
  }

  public Project getProject() {
    return project;
  }

  public NotificationType getType() {
    return type;
  }

  public String getProtocol() {
    return protocol;
  }

  public String getText() {
    return text;
  }

  public String getLink() {
    return link;
  }

  public int getReviewCycle() {
    return reviewCycle;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getReadAt() {
    return readAt;
  }
}
