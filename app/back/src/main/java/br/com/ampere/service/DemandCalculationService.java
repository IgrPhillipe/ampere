package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DemandContext;
import br.com.ampere.domain.DemandEngine;
import br.com.ampere.domain.DemandResult;
import br.com.ampere.domain.MissingNormativeValueException;
import br.com.ampere.domain.NormativeTableSet;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.NormativeTableRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service
public class DemandCalculationService {

  private final ProjectService projectService;
  private final ConsumerUnitGroupRepository groupRepository;
  private final NormativeTableRepository tableRepository;
  private final CalculationRepository calculationRepository;
  private final ObjectMapper objectMapper;

  public DemandCalculationService(
      ProjectService projectService,
      ConsumerUnitGroupRepository groupRepository,
      NormativeTableRepository tableRepository,
      CalculationRepository calculationRepository,
      ObjectMapper objectMapper) {
    this.projectService = projectService;
    this.groupRepository = groupRepository;
    this.tableRepository = tableRepository;
    this.calculationRepository = calculationRepository;
    this.objectMapper = objectMapper;
  }

  /** Every run is kept: a later one does not overwrite what an earlier one showed. */
  @Transactional
  public Calculation calculate(Long projectId) {
    Project project =
        projectService.draftOrFail(
            projectId, "Só é possível calcular a demanda de um projeto em rascunho.");
    List<ConsumerUnitGroup> groups = groupRepository.findAllByProjectIdOrderById(projectId);
    if (groups.isEmpty()) {
      throw unprocessable("Cadastre ao menos um grupo de unidades antes de calcular a demanda.");
    }
    if (!GroupValidation.of(groups).canCalculate()) {
      throw unprocessable("Há grupos com pendências. Corrija-os antes de calcular a demanda.");
    }

    BuildingType building = project.getBuildingType();
    DemandContext context =
        new DemandContext(
            new NormativeTableSet(tableRepository.findAllByStatus(NormativeTableStatus.PUBLISHED)),
            building.getVoltage(),
            building.getConnectionType());
    DemandResult result;
    try {
      result = DemandEngine.run(groups, context);
    } catch (MissingNormativeValueException missing) {
      throw unprocessable(missing.getMessage());
    }

    return calculationRepository.save(new Calculation(project, result, snapshot(project, groups)));
  }

  @Transactional(readOnly = true)
  public Calculation latest(Long projectId) {
    projectService.findById(projectId);

    return calculationRepository
        .findFirstByProjectIdOrderByIdDesc(projectId)
        .orElseThrow(
            () -> new NotFoundException("Nenhum cálculo de demanda foi feito para este projeto."));
  }

  private String snapshot(Project project, List<ConsumerUnitGroup> groups) {
    BuildingType building = project.getBuildingType();
    Map<String, Object> input = new LinkedHashMap<>();
    input.put("buildingType", building.category());
    input.put("floors", building.getFloors());
    input.put("voltage", building.getVoltage());
    input.put("connectionType", building.getConnectionType());
    input.put("entranceStandard", building.getEntranceStandard());
    input.put(
        "groups",
        groups.stream()
            .map(group -> Map.of("id", group.getId(), "kind", group.kind(), "spec", group.spec()))
            .toList());

    return objectMapper.writeValueAsString(input);
  }

  private static BusinessException unprocessable(String message) {
    return new BusinessException(message, HttpStatus.UNPROCESSABLE_CONTENT);
  }
}
