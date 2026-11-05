package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.Objects;

/**
 * Responsibility rule linking a municipality in the concession area to a single reviewer.
 */
@Entity
@Table(
    name = "reviewer_municipality",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_reviewer_municipality_state_name",
            columnNames = {"state", "municipality"}))
public class ReviewerMunicipality {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "reviewer_id", nullable = false)
  private User reviewer;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 2)
  private BrazilianState state;

  @Column(nullable = false)
  private String municipality;

  protected ReviewerMunicipality() {}

  public ReviewerMunicipality(User reviewer, BrazilianState state, String municipality) {
    this.reviewer = Objects.requireNonNull(reviewer, "reviewer");
    this.state = Objects.requireNonNull(state, "state");
    this.municipality = Objects.requireNonNull(municipality, "municipality");
  }

  public Long getId() {
    return id;
  }

  public User getReviewer() {
    return reviewer;
  }

  public BrazilianState getState() {
    return state;
  }

  public String getMunicipality() {
    return municipality;
  }
}
