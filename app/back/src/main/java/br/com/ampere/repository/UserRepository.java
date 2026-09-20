package br.com.ampere.repository;

import br.com.ampere.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Database access for the people who sign in. */
public interface UserRepository extends JpaRepository<User, Long> {

  /** The e-mail is stored folded, so callers must pass {@link User#normalizeEmail}. */
  Optional<User> findByEmail(String email);
}
