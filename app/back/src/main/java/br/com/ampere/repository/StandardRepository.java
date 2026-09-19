package br.com.ampere.repository;

import br.com.ampere.domain.Standard;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StandardRepository extends JpaRepository<Standard, Long> {
  Optional<Standard> findByName(String name);
}
