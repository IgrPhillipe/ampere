package br.com.ampere.repository;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

  /** The e-mail is stored folded, so callers must pass {@link User#normalizeEmail}. */
  Optional<User> findByEmail(String email);

  /** What every request checks the token against, without loading the whole account. */
  interface AccountStatus {

    boolean isActive();

    UserRole getRole();
  }

  /** Read on every request: a deactivated or changed account loses its open tokens. */
  Optional<AccountStatus> findStatusById(Long id);

  /** The e-mail and lowercase name also match, for rows written before the search index existed. */
  @Query(
      """
      SELECT account
      FROM User account
      WHERE (:role IS NULL OR account.role = :role)
        AND (
          :search = ''
          OR account.searchIndex LIKE CONCAT('%', :search, '%') ESCAPE '\'
          OR account.email LIKE CONCAT('%', :search, '%') ESCAPE '\'
          OR LOWER(account.name) LIKE CONCAT('%', :search, '%') ESCAPE '\'
        )
      """)
  Page<User> search(
      @Param("role") UserRole role, @Param("search") String search, Pageable pageable);
}
