package br.com.ampere.controller;

import br.com.ampere.domain.GroupSpec;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ConsumerUnitGroupRequest;
import br.com.ampere.dto.ConsumerUnitGroupResponse;
import br.com.ampere.dto.GroupValidationResponse;
import br.com.ampere.dto.LoadItemRequest;
import br.com.ampere.service.ConsumerUnitGroupService;
import br.com.ampere.service.GroupParameters;
import br.com.ampere.service.GroupValidation;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Consumer unit groups",
    description = "Cadastro e validação das unidades consumidoras de um projeto")
@RestController
@RequestMapping("/projects/{projectId}/groups")
public class ConsumerUnitGroupController {

  private final ConsumerUnitGroupService service;

  public ConsumerUnitGroupController(ConsumerUnitGroupService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(
      operationId = "listConsumerUnitGroups",
      summary = "Lista os grupos de unidades do projeto, com a validação de cada um")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Grupos do projeto"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado")
  })
  public ApiResponse<List<ConsumerUnitGroupResponse>> list(@PathVariable Long projectId) {
    return ApiResponse.of(
        service.list(projectId).stream().map(ConsumerUnitGroupResponse::from).toList());
  }

  @GetMapping("/validation")
  @Operation(
      operationId = "validateConsumerUnitGroups",
      summary = "Pendências que impedem o cálculo e os totais da etapa")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Situação da etapa"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado")
  })
  public ApiResponse<GroupValidationResponse> validation(@PathVariable Long projectId) {
    GroupValidation validation = service.validation(projectId);

    return ApiResponse.of(
        new GroupValidationResponse(
            validation.canCalculate(),
            validation.pendingIssues(),
            validation.totalGroups(),
            validation.totalUnits(),
            validation.totalDeclaredLoadKw()));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      operationId = "createConsumerUnitGroup",
      summary = "Cadastra um grupo, mesmo incompleto, e devolve o que falta nele")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Grupo cadastrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Dados do grupo inválidos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está mais em rascunho")
  })
  public ApiResponse<ConsumerUnitGroupResponse> create(
      @PathVariable Long projectId, @Valid @RequestBody ConsumerUnitGroupRequest request) {
    return ApiResponse.of(
        ConsumerUnitGroupResponse.from(service.create(projectId, parametersOf(request))));
  }

  @PutMapping("/{groupId}")
  @Operation(operationId = "updateConsumerUnitGroup", summary = "Atualiza um grupo de unidades")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Grupo atualizado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Dados do grupo inválidos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou grupo não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está mais em rascunho, ou o tipo do grupo mudou")
  })
  public ApiResponse<ConsumerUnitGroupResponse> update(
      @PathVariable Long projectId,
      @PathVariable Long groupId,
      @Valid @RequestBody ConsumerUnitGroupRequest request) {
    return ApiResponse.of(
        ConsumerUnitGroupResponse.from(service.update(projectId, groupId, parametersOf(request))));
  }

  @DeleteMapping("/{groupId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteConsumerUnitGroup", summary = "Exclui um grupo de unidades")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Grupo excluído"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou grupo não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está mais em rascunho")
  })
  public void delete(@PathVariable Long projectId, @PathVariable Long groupId) {
    service.delete(projectId, groupId);
  }

  private static GroupParameters parametersOf(ConsumerUnitGroupRequest request) {
    return new GroupParameters(
        request.kind(),
        new GroupSpec(
            request.name(),
            request.quantity(),
            request.usefulArea(),
            request.bedrooms(),
            request.unitLoadKw(),
            request.compactUnit(),
            request.usage(),
            request.items() == null
                ? null
                : request.items().stream().map(LoadItemRequest::toLoadItem).toList(),
            request.powerPerPointKw(),
            request.incorporatedInVehicle(),
            request.loadManagement(),
            request.stationType()));
  }
}
