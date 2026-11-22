package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.config.NormativeTableSeed;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableRow;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.StandardName;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

/** No transaction here on purpose: the controller maps the rows after the service returns. */
@SpringBootTest
class NormativeTableServiceIntegrationTest {

  private static final AuthenticatedUser ADMIN = new AuthenticatedUser(1L, UserRole.ADMIN);

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

    List<NormativeTable> tables = service.list(NormativeTableQuery.all(), ADMIN);
    NormativeTable detail = service.findById(tables.get(0).getId(), ADMIN);

    assertThat(tables).allSatisfy(table -> assertThat(table.getRows()).isNotEmpty());
    assertThat(tables.get(0).getStandard().getRevision()).isNotBlank();
    assertThat(detail.getRows()).isNotEmpty();
  }

  @Test
  void filtersTheStoredTablesByStatus() {
    List<Standard> standards =
        standardRepository.saveAll(
            List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    normativeTableRepository.saveAll(
        NormativeTableSeed.all(
            standards.stream().collect(Collectors.toMap(Standard::getName, Function.identity()))));

    List<NormativeTable> tables =
        service.list(
            new NormativeTableQuery(
                "dis-nor-030", Set.of(NormativeTableStatus.PUBLISHED), null, null),
            ADMIN);

    assertThat(tables)
        .isNotEmpty()
        .allSatisfy(
            table -> assertThat(table.getCode().standard()).isEqualTo(StandardName.DIS_NOR_030));
    assertThat(tables.get(0).getCode()).isEqualTo(NormativeTableCode.T5_MINIMUM_OUTLETS);
  }

  @Test
  void approvesOnlyTheVersionTheVerifierRead() {
    standardRepository.save(new Standard("DIS-NOR-053", "REV 06"));
    AuthenticatedUser reviewer = new AuthenticatedUser(2L, UserRole.REVIEWER);
    NormativeTable draft = service.create(quadro37("1.5"), "revisor@ampere.com", reviewer);
    NormativeTable revised =
        service.update(draft.getId(), quadro37("1.4"), "revisor@ampere.com", reviewer);

    assertThat(draft.getVersion()).isZero();
    assertThat(revised.getVersion()).isEqualTo(1);
    assertThatThrownBy(() -> service.publish(draft.getId(), 0, "analista@ampere.com", reviewer))
        .isInstanceOf(BusinessException.class)
        .extracting("status")
        .isEqualTo(HttpStatus.CONFLICT);
    assertThat(service.publish(draft.getId(), 1, "analista@ampere.com", reviewer).getStatus())
        .isEqualTo(NormativeTableStatus.PUBLISHED);
  }

  @Test
  void theDatabaseKeepsOneDraftPerTable() {
    Standard standard = standardRepository.save(new Standard("DIS-NOR-053", "REV 06"));
    NormativeTable published = draft(standard, "admin@ampere.com");
    published.publish("revisor@ampere.com");
    normativeTableRepository.saveAndFlush(published);
    normativeTableRepository.saveAndFlush(draft(standard, "admin@ampere.com"));

    assertThatThrownBy(
            () -> normativeTableRepository.saveAndFlush(draft(standard, "revisor@ampere.com")))
        .isInstanceOf(DataIntegrityViolationException.class)
        .hasMessageContaining(NormativeTableRepository.ONE_DRAFT_PER_CODE);
  }

  private static NormativeTable draft(Standard standard, String registeredBy) {
    NormativeTableParameters parameters = quadro37("1.5");

    return new NormativeTable(
        standard,
        parameters.code(),
        parameters.identification(),
        parameters.item(),
        parameters.page(),
        parameters.rows(),
        registeredBy);
  }

  private static NormativeTableParameters quadro37(String firstValue) {
    return new NormativeTableParameters(
        NormativeTableCode.Q37_SAFETY_FACTOR,
        "Quadro 37",
        "Anexo I, item 5",
        "108",
        List.of(
            new NormativeTableRow(
                null, null, new BigDecimal("25"), new BigDecimal(firstValue), null, null, null),
            new NormativeTableRow(
                null, new BigDecimal("25"), null, new BigDecimal("1.3"), null, null, null)));
  }
}
