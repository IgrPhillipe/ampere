package br.com.ampere.domain;

import br.com.ampere.utils.SearchTerms;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

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

  /** Professional registration. Null for accounts that predate the sign-up (seeded, admin). */
  private String crea;

  /** Two-letter state of the CREA registration. */
  @Column(length = 2)
  private String creaState;

  private String company;

  private String phone;

  @Column(nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  /** An inactive account cannot sign in, and its open tokens stop working. */
  @Column(nullable = false, columnDefinition = "boolean default true")
  private boolean active = true;

  /** Set by a temporary password: the next sign-in leads to the password change. */
  @Column(nullable = false, columnDefinition = "boolean default false")
  private boolean mustChangePassword;

  private OffsetDateTime lastLoginAt;

  /** Name and e-mail without accents, in lowercase, for the administrator's search. */
  @Column(nullable = false, columnDefinition = "text default ''")
  private String searchIndex;

  protected User() {}

  public User(String name, String email, String passwordHash, UserRole role) {
    this.name = name;
    this.email = normalizeEmail(email);
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    indexForSearch();
  }

  /** An account the administrator creates: it signs in with a temporary password. */
  public static User withTemporaryPassword(
      String name, String email, String passwordHash, UserRole role) {
    User user = new User(name.trim(), email, passwordHash, role);
    user.mustChangePassword = true;
    return user;
  }

  /** A designer signing up: the professional data identify the technical responsible. */
  public static User designer(
      String name,
      String email,
      String passwordHash,
      String crea,
      String creaState,
      String company,
      String phone) {
    User user = new User(name, email, passwordHash, UserRole.USER);
    user.updateProfile(name, crea, creaState, company, phone);
    return user;
  }

  public void updateProfile(
      String name, String crea, String creaState, String company, String phone) {
    this.name = name.trim();
    this.crea = upperOrNull(crea);
    this.creaState = upperOrNull(creaState);
    this.company = blankToNull(company);
    this.phone = blankToNull(phone);
  }

  /** A password the user chose, which ends any pending mandatory change. */
  public void changePasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
    this.mustChangePassword = false;
  }

  /** A password the administrator generated: the user must replace it on the next sign-in. */
  public void resetPassword(String temporaryPasswordHash) {
    this.passwordHash = temporaryPasswordHash;
    this.mustChangePassword = true;
  }

  public void administer(String name, UserRole role, boolean active) {
    this.name = name.trim();
    this.role = role;
    this.active = active;
  }

  public void recordSignIn() {
    this.lastLoginAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  private static String upperOrNull(String value) {
    String trimmed = blankToNull(value);
    return trimmed == null ? null : trimmed.toUpperCase(Locale.ROOT);
  }

  /** Also fills the index of accounts created before it existed. */
  public void indexForSearch() {
    searchIndex = SearchTerms.fold(name + " " + email);
  }

  @PrePersist
  private void onPersist() {
    createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    indexForSearch();
  }

  @PreUpdate
  private void onUpdate() {
    indexForSearch();
  }

  /** The form the column stores and every lookup compares against. */
  public static String normalizeEmail(String email) {
    return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
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

  public String getCrea() {
    return crea;
  }

  public String getCreaState() {
    return creaState;
  }

  /** The CREA as the stamp and the memorial print it, such as "123456/PE". */
  public String creaWithState() {
    if (crea == null) {
      return null;
    }

    return creaState == null ? crea : crea + "/" + creaState;
  }

  public String getCompany() {
    return company;
  }

  public String getPhone() {
    return phone;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public boolean isActive() {
    return active;
  }

  public boolean isMustChangePassword() {
    return mustChangePassword;
  }

  public OffsetDateTime getLastLoginAt() {
    return lastLoginAt;
  }
}
