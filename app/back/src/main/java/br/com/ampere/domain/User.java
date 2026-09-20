package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/** Someone who signs in to AMPERE. */
@Entity
@Table(name = "app_user")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  /** Stored folded to lowercase: sign-in must not depend on how the address was typed. */
  @Column(nullable = false, unique = true)
  private String email;

  /** BCrypt hash. The plain password never reaches the database or a log. */
  @Column(nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole role;

  @Column(nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  protected User() {}

  public User(String name, String email, String passwordHash, UserRole role) {
    this.name = name;
    this.email = normalizeEmail(email);
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  @PrePersist
  private void onPersist() {
    createdAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  /** The form the column stores and every lookup compares against. */
  public static String normalizeEmail(String email) {
    return email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getEmail() {
    return email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public UserRole getRole() {
    return role;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }
}
