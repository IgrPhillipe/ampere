package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableRow;
import br.com.ampere.domain.NormativeTableSort;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.StandardRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

class NormativeTableServiceTest {

  private static final OffsetDateTime DAY =
      OffsetDateTime.of(2026, 10, 1, 9, 0, 0, 0, ZoneOffset.UTC);

  private static final List<NormativeTable> TABLES =
      List.of(
          table(1L, NormativeTableCode.T19_THREE_PHASE_MOTORS, 1, 6),
          table(2L, NormativeTableCode.Q35_APARTMENT_DEMAND, 2, 3),
          table(3L, NormativeTableCode.Q35_APARTMENT_DEMAND, 4, 5),
          table(4L, NormativeTableCode.T6_RESIDENTIAL_LIGHTING_OUTLETS, 5, null));

  static {
    TABLES.get(1).supersede();
  }

  private final NormativeTableService service = service();

  @Test
  void listsInCatalogueOrderWithTheNewestRevisionFirst() {
    assertThat(ids(NormativeTableQuery.all())).containsExactly(3L, 2L, 4L, 1L);
  }

  @Test
  void filtersByStatusIgnoringBlankValues() {
    assertThat(
            ids(
                new NormativeTableQuery(
                    null, Arrays.asList(NormativeTableStatus.DRAFT, null), null, null)))
        .containsExactly(4L);
    assertThat(
            ids(
                new NormativeTableQuery(
                    null,
                    Set.of(NormativeTableStatus.PUBLISHED, NormativeTableStatus.SUPERSEDED),
                    null,
                    null)))
        .containsExactly(3L, 2L, 1L);
  }

  @Test
  void searchesIdentificationTitleItemAndStandardIgnoringAccents() {
    assertThat(ids(search("quadro 35"))).containsExactly(3L, 2L);
    assertThat(ids(search("TRIFASICOS"))).containsExactly(1L);
    assertThat(ids(search("6.27.1"))).containsExactly(4L);
    assertThat(ids(search("dis-nor-030"))).containsExactly(4L, 1L);
    assertThat(ids(search("  "))).hasSize(4);
  }

  @Test
  void sortsByRegistrationInBothDirections() {
    assertThat(ids(sort(NormativeTableSort.REGISTERED_AT, SortDirection.ASC)))
        .containsExactly(1L, 2L, 3L, 4L);
    assertThat(ids(sort(NormativeTableSort.REGISTERED_AT, SortDirection.DESC)))
        .containsExactly(4L, 3L, 2L, 1L);
  }

  @Test
  void keepsDraftsAfterThePublishedOnesWhenSortingByPublication() {
    assertThat(ids(sort(NormativeTableSort.VERIFIED_AT, SortDirection.ASC)))
        .containsExactly(2L, 3L, 1L, 4L);
    assertThat(ids(sort(NormativeTableSort.VERIFIED_AT, SortDirection.DESC)))
        .containsExactly(1L, 3L, 2L, 4L);
  }

  @Test
  void refusesARevisionFromADesigner() {
    NormativeTableParameters parameters =
        new NormativeTableParameters(
            NormativeTableCode.Q37_SAFETY_FACTOR, "Quadro 37", "Anexo I, item 5", "108", List.of());

    assertThatThrownBy(
            () ->
                service.create(
                    parameters, "user@ampere.com", new AuthenticatedUser(1L, UserRole.USER)))
        .isInstanceOf(BusinessException.class)
        .extracting("status")
        .isEqualTo(HttpStatus.FORBIDDEN);
  }

  @Test
  void refusesADraftCreatedAtTheSameInstantAsAnother() {
    NormativeTableRepository tables = mock(NormativeTableRepository.class);
    StandardRepository standards = mock(StandardRepository.class);
    when(standards.findByNameInOrderByName(List.of("DIS-NOR-053")))
        .thenReturn(List.of(new Standard("DIS-NOR-053", "REV 06")));
    when(tables.saveAndFlush(any()))
        .thenThrow(
            new DataIntegrityViolationException(
                "could not execute statement",
                new IllegalStateException(
                    "duplicate key value violates unique constraint \""
                        + NormativeTableRepository.ONE_DRAFT_PER_CODE
                        + "\"")));
    NormativeTableParameters parameters =
        new NormativeTableParameters(
            NormativeTableCode.Q37_SAFETY_FACTOR,
            "Quadro 37",
            "Anexo I, item 5",
            "108",
            List.of(new NormativeTableRow(null, null, null, BigDecimal.ONE, null, null, null)));

    assertThatThrownBy(
            () ->
                new NormativeTableService(tables, standards)
                    .create(
                        parameters,
                        "revisor@ampere.com",
                        new AuthenticatedUser(2L, UserRole.REVIEWER)))
        .isInstanceOf(BusinessException.class)
        .hasMessage(
            "Quadro 37 já tem uma revisão aguardando aprovação. Aprove ou exclua essa revisão"
                + " antes de cadastrar outra.")
        .extracting("status")
        .isEqualTo(HttpStatus.CONFLICT);
  }

  private List<Long> ids(NormativeTableQuery query) {
    return service.list(query, new AuthenticatedUser(1L, UserRole.ADMIN)).stream()
        .map(NormativeTable::getId)
        .toList();
  }

  private static NormativeTableQuery search(String term) {
    return new NormativeTableQuery(term, null, null, null);
  }

  private static NormativeTableQuery sort(NormativeTableSort sort, SortDirection direction) {
    return new NormativeTableQuery(null, null, sort, direction);
  }

  private static NormativeTableService service() {
    NormativeTableRepository repository = mock(NormativeTableRepository.class);
    when(repository.findListingBy()).thenReturn(TABLES);

    return new NormativeTableService(repository, mock(StandardRepository.class));
  }

  private static NormativeTable table(
      Long id, NormativeTableCode code, int registeredOn, Integer verifiedOn) {
    NormativeTable table =
        new NormativeTable(
            new Standard(code.standard().code(), "REV 06"),
            code,
            code.identification(),
            code.item(),
            code.page(),
            List.of(
                new NormativeTableRow(
                    null, null, null, BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ONE, null)),
            "admin@ampere.com");
    ReflectionTestUtils.setField(table, "id", id);
    ReflectionTestUtils.setField(table, "registeredAt", DAY.plusDays(registeredOn));
    if (verifiedOn != null) {
      table.publish("revisor@ampere.com");
      ReflectionTestUtils.setField(table, "verifiedAt", DAY.plusDays(verifiedOn));
    }

    return table;
  }
}
