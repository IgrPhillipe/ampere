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

/** An immutable fact in a project's history. */
@Entity
@Table(
    name = "project_event",
    indexes =
        @Index(name = "idx_project_event_timeline", columnList = "project_id, occurred_at, id"))
public class ProjectEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false, updatable = false)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Project project;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, updatable = false)
  private ProjectEventType type;

  @Column(nullable = false, updatable = false)
  private int version;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", updatable = false)
  private User author;

  @Enumerated(EnumType.STRING)
  @Column(updatable = false)
  private UserRole authorRole;

  @Column(nullable = false, length = 255, updatable = false)
  private String description;

  @Column(length = 2000, updatable = false)
  private String detail;

  @Column(name = "occurred_at", nullable = false, updatable = false)
  private OffsetDateTime occurredAt;

  protected ProjectEvent() {}

  public ProjectEvent(
      Project project,
      ProjectEventType type,
      int version,
      User author,
      UserRole authorRole,
      String description,
      String detail,
      OffsetDateTime occurredAt) {
    this.project = Objects.requireNonNull(project, "project");
    this.type = Objects.requireNonNull(type, "type");
    this.version = version;
    this.author = author;
    this.authorRole = authorRole;
    this.description = Objects.requireNonNull(description, "description");
    this.detail = detail == null || detail.isBlank() ? null : detail.trim();
    this.occurredAt = Objects.requireNonNull(occurredAt, "occurredAt");
    if ((author == null) != (authorRole == null)) {
      throw new IllegalArgumentException("Author and author role must both be present or absent.");
    }
  }

  public Long getId() {
    return id;
  }

  public Project getProject() {
    return project;
  }

  public ProjectEventType getType() {
    return type;
  }

  public int getVersion() {
    return version;
  }

  public User getAuthor() {
    return author;
  }

  public UserRole getAuthorRole() {
    return authorRole;
  }

  public String getDescription() {
    return description;
  }

  public String getDetail() {
    return detail;
  }

  public OffsetDateTime getOccurredAt() {
    return occurredAt;
  }
}
