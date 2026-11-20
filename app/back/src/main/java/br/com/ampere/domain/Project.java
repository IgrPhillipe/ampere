package br.com.ampere.domain;

import br.com.ampere.utils.SearchTerms;
import br.com.ampere.utils.Timestamps;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "project")
public class Project {

  public static final int REVIEW_PERIOD_DAYS = 30;

  // DIS-NOR-053, item 6.27.6.
  public static final int APPROVAL_VALIDITY_MONTHS = 36;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String address;

  @Column(nullable = false)
  private String municipality;

  // Projects created before the address came from the CEP are all in the Pernambuco concession.
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 2)
  @ColumnDefault("'PE'")
  private BrazilianState state = BrazilianState.PE;

  @Column(length = 8)
  private String postalCode;

  @Column(nullable = false, unique = true)
  private String protocol;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ProjectStatus status;

  @OneToOne(
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY,
      optional = false)
  @JoinColumn(name = "building_type_id", nullable = false)
  private BuildingType buildingType;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "project_standard",
      joinColumns = @JoinColumn(name = "project_id"),
      inverseJoinColumns = @JoinColumn(name = "standard_id"))
  @OrderBy("name")
  private final List<Standard> standards = new ArrayList<>();

  /** Nullable only for projects created before ownership was introduced. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id")
  private User owner;

  @ManyToOne(fetch = FetchType.LAZY)
  private User reviewer;

  @Column(nullable = false, columnDefinition = "integer default 0")
  private int reviewCycle;

  /** Stored with an offset so the API always answers with one. */
  @Column(nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(nullable = false)
  private OffsetDateTime updatedAt;

  private OffsetDateTime submittedAt;

  /**
   * The submission moved back by the review days already used before a rejection, so the deadline
   * resumes with the days that were left. Null before this was recorded: the submission itself.
   */
  private OffsetDateTime reviewClockStartedAt;

  /** Days the review period stood still while the project waited for the designer's fixes. */
  @Column(nullable = false, columnDefinition = "integer default 0")
  private int suspendedReviewDays;

  private OffsetDateTime reviewedAt;

  @Column(length = 2000)
  private String reviewOpinion;

  @Column(length = 2000)
  private String changeSummary;

  @Column(nullable = false)
  private String searchIndex;

  @Column(nullable = false, columnDefinition = "varchar(255) default ''")
  private String reviewSearchIndex;

  protected Project() {}

  public Project(
      String name,
      String address,
      String municipality,
      String protocol,
      ProjectStatus status,
      BuildingType buildingType,
      List<Standard> standards) {
    this(name, address, municipality, protocol, status, buildingType, standards, null);
  }

  public Project(
      String name,
      String address,
      String municipality,
      String protocol,
      ProjectStatus status,
      BuildingType buildingType,
      List<Standard> standards,
      User owner) {
    this.name = name;
    this.address = address;
    this.municipality = municipality;
    this.protocol = protocol;
    this.status = status;
    this.buildingType = Objects.requireNonNull(buildingType, "buildingType");
    this.standards.addAll(standards);
    this.owner = owner;
    this.createdAt = now();
    this.updatedAt = this.createdAt;
    this.searchIndex = searchIndexOf(name, protocol);
    this.reviewSearchIndex = reviewSearchIndexOf(protocol, municipality, owner);
  }

  /** A newly created project: a draft, with the protocol the system assigned it. */
  public static Project draft(
      String name,
      String address,
      String municipality,
      String protocol,
      BuildingType buildingType,
      List<Standard> standards) {
    return draft(name, address, municipality, protocol, buildingType, standards, null);
  }

  public static Project draft(
      String name,
      String address,
      String municipality,
      String protocol,
      BuildingType buildingType,
      List<Standard> standards,
      User owner) {
    return new Project(
        name, address, municipality, protocol, ProjectStatus.DRAFT, buildingType, standards, owner);
  }

  @PrePersist
  private void onPersist() {
    createdAt = now();
    updatedAt = createdAt;
    searchIndex = searchIndexOf(name, protocol);
    reviewSearchIndex = reviewSearchIndexOf(protocol, municipality, owner);
  }

  @PreUpdate
  private void onUpdate() {
    updatedAt = now();
    searchIndex = searchIndexOf(name, protocol);
    reviewSearchIndex = reviewSearchIndexOf(protocol, municipality, owner);
  }

  private static OffsetDateTime now() {
    return Timestamps.now();
  }

  private static String searchIndexOf(String name, String protocol) {
    return SearchTerms.fold(name + " " + protocol);
  }

  private static String reviewSearchIndexOf(String protocol, String municipality, User owner) {
    String ownerName = owner == null ? "" : owner.getName();
    return SearchTerms.fold(protocol + " " + municipality + " " + ownerName);
  }

  public void rename(String name, String address, String municipality) {
    this.name = name;
    this.address = address;
    this.municipality = municipality;
  }

  public void locate(String postalCode, BrazilianState state) {
    this.postalCode = postalCode;
    this.state = Objects.requireNonNull(state, "state");
  }

  public void changeBuildingType(BuildingType buildingType) {
    this.buildingType = Objects.requireNonNull(buildingType, "buildingType");
  }

  public void applyStandards(List<Standard> standards) {
    this.standards.clear();
    this.standards.addAll(standards);
  }

  /**
   * Starts a review cycle. A resubmission after a rejection resumes the 30-day period with the days
   * left at the rejection, and the days spent waiting for the fixes count as suspended.
   *
   * @return the days the period stood suspended until this submission; zero on the first one
   */
  public long submit(OffsetDateTime submittedAt) {
    Objects.requireNonNull(submittedAt, "submittedAt");
    long waited = 0;
    if (isReviewSuspended()) {
      long used = Timestamps.daysBetween(reviewClockStart(), reviewedAt);
      waited = Math.max(0, Timestamps.daysBetween(reviewedAt, submittedAt));
      this.suspendedReviewDays = Math.toIntExact(suspendedReviewDays + waited);
      this.reviewClockStartedAt = submittedAt.minusDays(used);
    } else {
      this.reviewClockStartedAt = submittedAt;
    }
    this.status = ProjectStatus.UNDER_REVIEW;
    this.submittedAt = submittedAt;
    this.reviewedAt = null;
    this.reviewOpinion = null;
    this.reviewCycle++;

    return waited;
  }

  public void recordChangeSummary(String changeSummary) {
    this.changeSummary =
        changeSummary == null || changeSummary.isBlank() ? null : changeSummary.trim();
  }

  public void approve(OffsetDateTime reviewedAt) {
    approve(reviewedAt, null);
  }

  public void approve(OffsetDateTime reviewedAt, String opinion) {
    conclude(ProjectStatus.APPROVED, reviewedAt, opinion);
  }

  public void reject(OffsetDateTime reviewedAt) {
    reject(reviewedAt, null);
  }

  public void reject(OffsetDateTime reviewedAt, String opinion) {
    conclude(ProjectStatus.REJECTED, reviewedAt, opinion);
  }

  public void assignReviewer(User reviewer) {
    this.reviewer = Objects.requireNonNull(reviewer, "reviewer");
  }

  public void clearReviewer() {
    this.reviewer = null;
  }

  /** Nobody reviews their own project, not even the administrator. */
  public boolean canBeReviewedBy(User user) {
    return user.isActiveReviewer() && !isOwnedBy(user.getId());
  }

  public boolean isAssignedTo(Long userId) {
    return reviewer != null && reviewer.getId().equals(userId);
  }

  private void conclude(ProjectStatus outcome, OffsetDateTime reviewedAt, String opinion) {
    this.status = outcome;
    this.reviewedAt = Objects.requireNonNull(reviewedAt, "reviewedAt");
    this.reviewOpinion = opinion == null || opinion.isBlank() ? null : opinion.trim();
  }

  /**
   * Last day of the review period: 30 calendar days after the day of submission, plus the days it
   * stood suspended in earlier cycles.
   */
  public LocalDate reviewDeadline(ZoneId zone) {
    if (submittedAt == null) {
      throw new IllegalStateException("Project has not been submitted.");
    }

    return reviewClockStart().atZoneSameInstant(zone).toLocalDate().plusDays(REVIEW_PERIOD_DAYS);
  }

  /**
   * Calendar days of the review period already used, suspended days excluded. Counts up to today
   * while under review and stops at the decision otherwise.
   */
  public long elapsedReviewDays(LocalDate today, ZoneId zone) {
    if (submittedAt == null) {
      return 0;
    }
    LocalDate end =
        isUnderReview() || reviewedAt == null
            ? today
            : reviewedAt.atZoneSameInstant(zone).toLocalDate();

    return Math.max(
        0, ChronoUnit.DAYS.between(reviewClockStart().atZoneSameInstant(zone).toLocalDate(), end));
  }

  /** Days the period stood suspended, the current wait for the designer's fixes included. */
  public long suspendedReviewDays(LocalDate today, ZoneId zone) {
    if (!isReviewSuspended()) {
      return suspendedReviewDays;
    }

    return suspendedReviewDays
        + Math.max(
            0, ChronoUnit.DAYS.between(reviewedAt.atZoneSameInstant(zone).toLocalDate(), today));
  }

  /** Days left in the review period; negative once overdue. Frozen while suspended. */
  public long remainingReviewDays(LocalDate today, ZoneId zone) {
    return REVIEW_PERIOD_DAYS - elapsedReviewDays(today, zone);
  }

  /** A rejected project waits for the designer, and the review period waits with it. */
  public boolean isReviewSuspended() {
    return isRejected() && wasSubmitted() && reviewedAt != null;
  }

  /** The last day the approval is valid; from the next day on the project is expired. */
  public LocalDate approvalExpiresOn(ZoneId zone) {
    if (reviewedAt == null) {
      throw new IllegalStateException("Project has not been reviewed.");
    }

    return reviewedAt.atZoneSameInstant(zone).toLocalDate().plusMonths(APPROVAL_VALIDITY_MONTHS);
  }

  public boolean isApprovalExpired(LocalDate today, ZoneId zone) {
    return status == ProjectStatus.APPROVED && today.isAfter(approvalExpiresOn(zone));
  }

  /** The approval date stays: it is where the validity counted from. */
  public void expire() {
    if (status != ProjectStatus.APPROVED) {
      throw new IllegalStateException("Only an approved project expires.");
    }
    this.status = ProjectStatus.EXPIRED;
  }

  private OffsetDateTime reviewClockStart() {
    return reviewClockStartedAt == null ? submittedAt : reviewClockStartedAt;
  }

  public DeadlineStatus deadlineStatus(LocalDate today, ZoneId zone) {
    LocalDate deadline = reviewDeadline(zone);
    if (deadline.isBefore(today)) {
      return DeadlineStatus.OVERDUE;
    }

    return deadline.isEqual(today) ? DeadlineStatus.DUE_TODAY : DeadlineStatus.ON_TIME;
  }

  /** The review period and the approval validity as they stand on {@code today}. */
  public ReviewTimeline reviewTimeline(LocalDate today, ZoneId zone) {
    LocalDate validUntil = wasApproved() && reviewedAt != null ? approvalExpiresOn(zone) : null;
    if (!wasSubmitted()) {
      return new ReviewTimeline(null, null, null, null, null, false, validUntil);
    }
    boolean running = isUnderReview();
    boolean suspended = isReviewSuspended();

    return new ReviewTimeline(
        running ? reviewDeadline(zone) : null,
        running ? deadlineStatus(today, zone) : null,
        running || suspended ? remainingReviewDays(today, zone) : null,
        elapsedReviewDays(today, zone),
        suspendedReviewDays(today, zone),
        suspended,
        validUntil);
  }

  public boolean isDraft() {
    return status == ProjectStatus.DRAFT;
  }

  public boolean isRejected() {
    return status == ProjectStatus.REJECTED;
  }

  public boolean isEditable() {
    return status == ProjectStatus.DRAFT || status == ProjectStatus.REJECTED;
  }

  public boolean isUnderReview() {
    return status == ProjectStatus.UNDER_REVIEW;
  }

  public boolean wasApproved() {
    return status.wasApproved();
  }

  public boolean canBeSubmitted() {
    return status == ProjectStatus.DRAFT
        || status == ProjectStatus.AWAITING_SUBMISSION
        || status == ProjectStatus.REJECTED;
  }

  public boolean isReanalysis() {
    return reviewCycle > 1;
  }

  public boolean wasSubmitted() {
    return submittedAt != null;
  }

  public boolean isOwnedBy(Long userId) {
    return owner != null && owner.getId().equals(userId);
  }

  /** Marks a change made through the project's groups, documents or calculation. */
  public void touch() {
    updatedAt = now();
  }

  public void assignOwner(User owner) {
    this.owner = Objects.requireNonNull(owner, "owner");
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getAddress() {
    return address;
  }

  public String getMunicipality() {
    return municipality;
  }

  public BrazilianState getState() {
    return state;
  }

  public String getPostalCode() {
    return postalCode;
  }

  public String formattedPostalCode() {
    return postalCode == null ? null : postalCode.substring(0, 5) + "-" + postalCode.substring(5);
  }

  public String getProtocol() {
    return protocol;
  }

  public ProjectStatus getStatus() {
    return status;
  }

  public BuildingType getBuildingType() {
    return buildingType;
  }

  public List<Standard> getStandards() {
    return List.copyOf(standards);
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public OffsetDateTime getSubmittedAt() {
    return submittedAt;
  }

  public OffsetDateTime getReviewClockStartedAt() {
    return reviewClockStartedAt;
  }

  public int getSuspendedReviewDays() {
    return suspendedReviewDays;
  }

  public OffsetDateTime getReviewedAt() {
    return reviewedAt;
  }

  public String getReviewOpinion() {
    return reviewOpinion;
  }

  public String getChangeSummary() {
    return changeSummary;
  }

  public User getOwner() {
    return owner;
  }

  public User getReviewer() {
    return reviewer;
  }

  public int getReviewCycle() {
    return reviewCycle;
  }

  public String getSearchIndex() {
    return searchIndex;
  }

  public String getReviewSearchIndex() {
    return reviewSearchIndex;
  }
}
