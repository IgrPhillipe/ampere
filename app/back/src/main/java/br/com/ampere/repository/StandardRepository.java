package br.com.ampere.repository;

import br.com.ampere.domain.Standard;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StandardRepository extends JpaRepository<Standard, Long> {

  List<Standard> findByNameInOrderByName(Collection<String> names);
}
