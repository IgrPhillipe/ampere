package br.com.ampere.repository;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
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
  }

  /** Read on every request, without loading the whole account. */
  Optional<AccountStatus> findStatusById(Long id);

  @Query(
      """
      SELECT account
      FROM User account
      WHERE (:role IS NULL OR account.role = :role)
        AND (
          :search = ''
          OR account.searchIndex LIKE CONCAT('%', :search, '%') ESCAPE '\\'
        )
      """)
  Page<User> search(
      @Param("role") UserRole role, @Param("search") String search, Pageable pageable);

  List<User> findAllBySearchIndex(String searchIndex);

  List<User> findAllByRoleInAndActiveTrueOrderByNameAsc(Collection<UserRole> roles);
}
