package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.repository.ProjectRepository;
import java.util.List;
import org.junit.jupiter.api.Test;

class LegacyAddressMigrationTest {

  @Test
  void splitsTheStateAndStoresTheIbgeSpelling() {
    Project legacy = project("jaboatao dos guararapes/pe");
    Project clean = project("Recife");
    ProjectRepository repository = mock(ProjectRepository.class);
    when(repository.findAll()).thenReturn(List.of(legacy, clean));

    new LegacyAddressMigration(repository).run(null);

    assertThat(legacy.getMunicipality()).isEqualTo("Jaboatão dos Guararapes");
    assertThat(legacy.getState()).isEqualTo(BrazilianState.PE);
    verify(repository).saveAll(List.of(legacy));
  }

  @Test
  void changesNothingOnceTheDataIsClean() {
    ProjectRepository repository = mock(ProjectRepository.class);
    when(repository.findAll()).thenReturn(List.of(project("Olinda")));

    new LegacyAddressMigration(repository).run(null);

    verify(repository, never()).saveAll(anyList());
  }

  private static Project project(String municipality) {
    return Project.draft(
        "Residencial",
        "Rua 1",
        municipality,
        "2026-0001",
        BuildingCategory.RESIDENTIAL_MULTIFAMILY.create(
            4, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        List.of());
  }
}
