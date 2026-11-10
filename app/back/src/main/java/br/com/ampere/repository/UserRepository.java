package br.com.ampere.repository;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

  /** The e-mail is stored folded, so callers must pass {@link User#normalizeEmail}. */
  Optional<User> findByEmail(String email);

  interface AccountStatus {

    boolean isActive();

    UserRole getRole();

    boolean isMustChangePassword();
  }

  /** Read on every request, without loading the whole account. */
  Optional<AccountStatus> findStatusById(Long id);

  @Query(
      """
      SELECT account
      FROM User account
      WHERE (:role IS NULL OR account.role = :role)
        AND (:active IS NULL OR account.active = :active)
        AND (:mustChangePassword IS NULL OR account.mustChangePassword = :mustChangePassword)
        AND (CAST(:inactiveSince AS OffsetDateTime) IS NULL
          OR account.lastLoginAt IS NULL
          OR account.lastLoginAt < :inactiveSince)
        AND (
          :search = ''
          OR account.searchIndex LIKE CONCAT('%', :search, '%') ESCAPE '\\'
        )
      """)
  Page<User> search(
      @Param("role") UserRole role,
      @Param("active") Boolean active,
      @Param("mustChangePassword") Boolean mustChangePassword,
      @Param("inactiveSince") OffsetDateTime inactiveSince,
      @Param("search") String search,
      Pageable pageable);

  interface RoleCount {

    UserRole getRole();

    long getTotal();
  }

  @Query(
      """
      SELECT account.role AS role, COUNT(account) AS total
      FROM User account
      WHERE account.active = true
      GROUP BY account.role
      """)
  List<RoleCount> countActiveByRole();

  long countByActiveFalse();

  long countByMustChangePasswordTrue();

  @Query(
      """
      SELECT COUNT(account)
      FROM User account
      WHERE account.active = true
        AND (account.lastLoginAt IS NULL OR account.lastLoginAt < :since)
      """)
  long countActiveWithoutAccessSince(@Param("since") OffsetDateTime since);

  List<User> findAllBySearchIndex(String searchIndex);

  List<User> findAllByRoleInAndActiveTrueOrderByNameAsc(Collection<UserRole> roles);
}
