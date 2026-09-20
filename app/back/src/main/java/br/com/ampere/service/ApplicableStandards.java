package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.StandardName;
import br.com.ampere.repository.StandardRepository;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

/** Loads the persisted revisions of the standards a building type is calculated under. */
@Service
public class ApplicableStandards {

  private final StandardRepository standardRepository;

  public ApplicableStandards(StandardRepository standardRepository) {
    this.standardRepository = standardRepository;
  }

  public List<Standard> of(BuildingType buildingType) {
    Set<StandardName> required = buildingType.applicableStandards();
    List<String> codes = required.stream().map(StandardName::code).toList();
    List<Standard> found = standardRepository.findByNameInOrderByName(codes);

    if (found.size() != required.size()) {
      throw new IllegalStateException("Standards are not seeded: expected " + codes);
    }

    return found;
  }
}
