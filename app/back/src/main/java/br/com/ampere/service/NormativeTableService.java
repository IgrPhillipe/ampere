package br.com.ampere.service;

import br.com.ampere.domain.NormativeTable;
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
import java.util.List;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NormativeTableService {

  private static final String NOT_FOUND = "Tabela normativa não encontrada.";
  private static final String NOT_DRAFT =
      "Uma revisão publicada não é editada. Cadastre uma nova tabela.";

  private final NormativeTableRepository tableRepository;
  private final StandardRepository standardRepository;

  public NormativeTableService(
      NormativeTableRepository tableRepository, StandardRepository standardRepository) {
    this.tableRepository = tableRepository;
    this.standardRepository = standardRepository;
  }

  /** In memory: the title and the catalogue order live in the enum, and the list is small. */
  @Transactional(readOnly = true)
  public List<NormativeTable> list(NormativeTableQuery query, AuthenticatedUser user) {
    user.requireAdmin();
    String search = SearchTerms.fold(query.search());

    return tableRepository.findListingBy().stream()
        .filter(table -> query.statuses().isEmpty() || query.statuses().contains(table.getStatus()))
        .filter(table -> search.isEmpty() || matches(table, search))
        .sorted(
            comparatorOf(query.sort(), query.direction())
                .thenComparing(NormativeTable::getId, Comparator.reverseOrder()))
        .toList();
  }

  @Transactional(readOnly = true)
  public NormativeTable findById(Long id, AuthenticatedUser user) {
    user.requireAdmin();

    return tableRepository.findDetailById(id).orElseThrow(() -> new NotFoundException(NOT_FOUND));
  }

  @Transactional
  public NormativeTable create(
      NormativeTableParameters parameters, String registeredBy, AuthenticatedUser user) {
    user.requireAdmin();
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

    return tableRepository.save(table);
  }

  @Transactional
  public NormativeTable update(
      Long id, NormativeTableParameters parameters, AuthenticatedUser user) {
    NormativeTable table = draftOrFail(id, NOT_DRAFT, user);
    if (table.getCode() != parameters.code()) {
      throw new BusinessException(
          "A tabela de uma revisão não muda. Cadastre outra tabela.", HttpStatus.CONFLICT);
    }

    table.revise(
        parameters.identification(), parameters.item(), parameters.page(), parameters.rows());
    rejectProblems(table);

    return table;
  }

  /** The verifier must not be who typed it; the previous published revision is superseded. */
  @Transactional
  public NormativeTable publish(Long id, String verifiedBy, AuthenticatedUser user) {
    NormativeTable table = draftOrFail(id, "Esta tabela já foi publicada.", user);
    if (!table.isVerifiableBy(verifiedBy)) {
      throw new BusinessException(
          "Quem cadastrou a tabela não pode aprová-la. A publicação é feita por outro administrador.",
          HttpStatus.CONFLICT);
    }
    rejectProblems(table);

    tableRepository
        .findByCodeAndStatus(table.getCode(), NormativeTableStatus.PUBLISHED)
        .ifPresent(NormativeTable::supersede);
    table.publish(verifiedBy);

    return table;
  }

  @Transactional
  public void delete(Long id, AuthenticatedUser user) {
    tableRepository.delete(
        draftOrFail(id, "Só é possível excluir uma tabela aguardando revisão.", user));
  }

  private NormativeTable draftOrFail(Long id, String message, AuthenticatedUser user) {
    NormativeTable table = findById(id, user);
    if (!table.isDraft()) {
      throw new BusinessException(message, HttpStatus.CONFLICT);
    }

    return table;
  }

  private Standard standardOf(NormativeTableParameters parameters) {
    String name = parameters.code().standard().code();

    return standardRepository.findByNameInOrderByName(List.of(name)).stream()
        .findFirst()
        .orElseThrow(() -> new NotFoundException("Norma " + name + " não cadastrada."));
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
