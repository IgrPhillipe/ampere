package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.Standard;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** No transaction here on purpose: the controller maps the rows after the service returns. */
@SpringBootTest
class NormativeTableServiceIntegrationTest {

  @Autowired private NormativeTableService service;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private StandardRepository standardRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private ProjectRepository projectRepository;

  @BeforeEach
  @AfterEach
  void clear() {
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
  }

  @Test
  void loadsTheStandardAndTheRowsOutsideTheTransaction() {
    List<Standard> standards =
        standardRepository.saveAll(
            List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    normativeTableRepository.saveAll(
        NormativeTableSeed.all(
            standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()))));

    List<NormativeTable> tables = service.list();
    NormativeTable detail = service.findById(tables.get(0).getId());

    assertThat(tables).allSatisfy(table -> assertThat(table.getRows()).isNotEmpty());
    assertThat(tables.get(0).getStandard().getRevision()).isNotBlank();
    assertThat(detail.getRows()).isNotEmpty();
  }
}
