package br.com.ampere.service;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.Standard;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.StandardRepository;
import java.util.Comparator;
import java.util.List;
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

  /** In catalogue order (Quadro 33 before Tabela 1 before Tabela 19), newest revision first. */
  @Transactional(readOnly = true)
  public List<NormativeTable> list() {
    return tableRepository.findAllByOrderByCodeAscIdDesc().stream()
        .sorted(
            Comparator.comparing(NormativeTable::getCode)
                .thenComparing(NormativeTable::getId, Comparator.reverseOrder()))
        .toList();
  }

  @Transactional(readOnly = true)
  public NormativeTable findById(Long id) {
    return tableRepository.findDetailById(id).orElseThrow(() -> new NotFoundException(NOT_FOUND));
  }

  @Transactional
  public NormativeTable create(NormativeTableParameters parameters, String registeredBy) {
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
  public NormativeTable update(Long id, NormativeTableParameters parameters) {
    NormativeTable table = draftOrFail(id, NOT_DRAFT);
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
  public NormativeTable publish(Long id, String verifiedBy) {
    NormativeTable table = draftOrFail(id, "Esta tabela já foi publicada.");
    if (!table.isVerifiableBy(verifiedBy)) {
      throw new BusinessException(
          "Quem cadastrou a tabela não pode aprová-la. A publicação é feita por um revisor.",
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
  public void delete(Long id) {
    tableRepository.delete(draftOrFail(id, "Só é possível excluir uma tabela aguardando revisão."));
  }

  private NormativeTable draftOrFail(Long id, String message) {
    NormativeTable table = findById(id);
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

  private static void rejectProblems(NormativeTable table) {
    List<String> problems = table.problems();
    if (!problems.isEmpty()) {
      throw new BusinessException(String.join(" ", problems));
    }
  }
}
