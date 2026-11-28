package br.com.ampere.service;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableSort;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.domain.Standard;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.utils.SearchTerms;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NormativeTableService {

  private static final String NOT_FOUND = "Tabela normativa não encontrada.";
  private static final String NOT_DRAFT =
      "Uma revisão aprovada não é editada. Cadastre uma nova revisão.";

  private static final Comparator<NormativeTable> REPRESENTATIVE_FIRST =
      Comparator.comparingInt((NormativeTable table) -> representationRank(table.getStatus()))
          .thenComparing(
              NormativeTable::getVerifiedAt, Comparator.nullsLast(Comparator.reverseOrder()))
          .thenComparing(NormativeTable::getId, Comparator.reverseOrder());

  private final NormativeTableRepository tableRepository;
  private final StandardRepository standardRepository;

  public NormativeTableService(
      NormativeTableRepository tableRepository, StandardRepository standardRepository) {
    this.tableRepository = tableRepository;
    this.standardRepository = standardRepository;
  }

  /**
   * One line per code, kept when any of its revisions passes the status filter and the search. The
   * line shows the first of those revisions in effect order: the published one, then the draft,
   * then the most recently superseded. In memory: the title and the catalogue order live in the
   * enum, and the list is small.
   */
  @Transactional(readOnly = true)
  public List<NormativeTableListing> list(NormativeTableQuery query, AuthenticatedUser user) {
    user.requireReviewer();
    String search = SearchTerms.fold(query.search());
    Map<NormativeTableCode, List<NormativeTable>> revisionsByCode =
        tableRepository.findListingBy().stream()
            .collect(
                Collectors.groupingBy(
                    NormativeTable::getCode,
                    () -> new EnumMap<>(NormativeTableCode.class),
                    Collectors.toList()));

    return revisionsByCode.values().stream()
        .map(revisions -> listingOf(revisions, query, search))
        .flatMap(Optional::stream)
        .sorted(
            Comparator.comparing(
                    NormativeTableListing::table, comparatorOf(query.sort(), query.direction()))
                .thenComparing(listing -> listing.table().getId(), Comparator.reverseOrder()))
        .toList();
  }

  private static Optional<NormativeTableListing> listingOf(
      List<NormativeTable> revisions, NormativeTableQuery query, String search) {
    return revisions.stream()
        .filter(table -> query.statuses().isEmpty() || query.statuses().contains(table.getStatus()))
        .filter(table -> search.isEmpty() || matches(table, search))
        .min(REPRESENTATIVE_FIRST)
        .map(
            table ->
                new NormativeTableListing(
                    table,
                    table.isDraft()
                        ? null
                        : revisions.stream()
                            .filter(NormativeTable::isDraft)
                            .findFirst()
                            .orElse(null),
                    revisions.size()));
  }

  @Transactional(readOnly = true)
  public NormativeTable findById(Long id, AuthenticatedUser user) {
    user.requireReviewer();

    return tableRepository.findDetailById(id).orElseThrow(() -> new NotFoundException(NOT_FOUND));
  }

  /** One pending revision per table, so publishing it never drops another one's changes. */
  @Transactional
  public NormativeTable create(
      NormativeTableParameters parameters, String registeredBy, AuthenticatedUser user) {
    user.requireReviewer();
    if (tableRepository.existsByCodeAndStatus(parameters.code(), NormativeTableStatus.DRAFT)) {
      throw pendingRevision(parameters.code());
    }
    NormativeTable table =
        new NormativeTable(
            standardOf(parameters),
            parameters.code(),
            parameters.identification(),
            parameters.item(),
            parameters.page(),
            parameters.rows(),
            registeredBy);
    rejectProblems(table);

    try {
      return tableRepository.saveAndFlush(table);
    } catch (DataIntegrityViolationException exception) {
      // Another draft of the same table was created between the check above and this insert.
      if (Objects.toString(exception.getMostSpecificCause().getMessage(), "")
          .contains(NormativeTableRepository.ONE_DRAFT_PER_CODE)) {
        throw pendingRevision(parameters.code());
      }
      throw exception;
    }
  }

  @Transactional
  public NormativeTable update(
      Long id, NormativeTableParameters parameters, String editedBy, AuthenticatedUser user) {
    NormativeTable table = draftOrFail(id, NOT_DRAFT, user);
    if (!table.isEditableBy(editedBy)) {
      throw new BusinessException(
          "Só quem cadastrou a revisão pode alterá-la.", HttpStatus.FORBIDDEN);
    }
    if (table.getCode() != parameters.code()) {
      throw new BusinessException(
          "A tabela de uma revisão não muda. Cadastre uma revisão da outra tabela.",
          HttpStatus.CONFLICT);
    }

    table.revise(
        editedBy,
        parameters.identification(),
        parameters.item(),
        parameters.page(),
        parameters.rows());
    rejectProblems(table);

    return table;
  }

  /**
   * The verifier must not be who typed it, and approves the version they read; the previous
   * published revision is superseded.
   */
  @Transactional
  public NormativeTable publish(
      Long id, long readVersion, String verifiedBy, AuthenticatedUser user) {
    NormativeTable table = draftOrFail(id, "Esta revisão já foi aprovada.", user);
    if (!table.isVerifiableBy(verifiedBy)) {
      throw new BusinessException(
          "Quem cadastrou a tabela não pode aprová-la. A publicação é feita por outra pessoa.",
          HttpStatus.CONFLICT);
    }
    if (table.getVersion() != readVersion) {
      throw new BusinessException(
          "A revisão mudou depois que você a abriu. Confira os valores de novo antes de aprovar.",
          HttpStatus.CONFLICT);
    }
    rejectProblems(table);

    var previous =
        tableRepository.findByCodeAndStatus(table.getCode(), NormativeTableStatus.PUBLISHED);
    table.publish(verifiedBy);
    previous.ifPresent(old -> old.supersede(table.getVerifiedAt()));

    return table;
  }

  /** The admin also deletes someone else's draft, so an abandoned one does not linger. */
  @Transactional
  public void delete(Long id, String deletedBy, AuthenticatedUser user) {
    NormativeTable table =
        draftOrFail(id, "Só é possível excluir uma revisão aguardando aprovação.", user);
    if (!user.isAdmin() && !table.isEditableBy(deletedBy)) {
      throw new BusinessException(
          "Só quem cadastrou a revisão ou um gestor pode excluí-la.", HttpStatus.FORBIDDEN);
    }

    tableRepository.delete(table);
  }

  private NormativeTable draftOrFail(Long id, String message, AuthenticatedUser user) {
    NormativeTable table = findById(id, user);
    if (!table.isDraft()) {
      throw new BusinessException(message, HttpStatus.CONFLICT);
    }

    return table;
  }

  private static BusinessException pendingRevision(NormativeTableCode code) {
    return new BusinessException(
        code.identification()
            + " já tem uma revisão aguardando aprovação. Aprove ou exclua essa revisão antes de"
            + " cadastrar outra.",
        HttpStatus.CONFLICT);
  }

  private Standard standardOf(NormativeTableParameters parameters) {
    String name = parameters.code().standard().code();

    return standardRepository.findByNameInOrderByName(List.of(name)).stream()
        .findFirst()
        .orElseThrow(() -> new NotFoundException("Norma " + name + " não cadastrada."));
  }

  private static int representationRank(NormativeTableStatus status) {
    return switch (status) {
      case PUBLISHED -> 0;
      case DRAFT -> 1;
      case SUPERSEDED -> 2;
    };
  }

  private static boolean matches(NormativeTable table, String search) {
    return Stream.of(
            table.getIdentification(),
            table.getCode().title(),
            table.getItem(),
            table.getCode().standard().code())
        .map(SearchTerms::fold)
        .anyMatch(text -> text.contains(search));
  }

  /** Drafts have no publication date and stay after the published ones in either direction. */
  private static Comparator<NormativeTable> comparatorOf(
      NormativeTableSort sort, SortDirection direction) {
    Comparator<NormativeTable> column =
        switch (sort) {
          case CODE -> Comparator.comparing(NormativeTable::getCode);
          case REGISTERED_AT -> Comparator.comparing(NormativeTable::getRegisteredAt);
          case VERIFIED_AT ->
              Comparator.comparing(
                  NormativeTable::getVerifiedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        };
    Comparator<NormativeTable> directed =
        direction == SortDirection.DESC ? column.reversed() : column;

    return sort == NormativeTableSort.VERIFIED_AT
        ? Comparator.comparing((NormativeTable table) -> table.getVerifiedAt() == null)
            .thenComparing(directed)
        : directed;
  }

  private static void rejectProblems(NormativeTable table) {
    List<String> problems = table.problems();
    if (!problems.isEmpty()) {
      throw new BusinessException(String.join(" ", problems));
    }
  }
}
