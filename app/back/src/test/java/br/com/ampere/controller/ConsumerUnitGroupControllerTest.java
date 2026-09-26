package br.com.ampere.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.EnumParameterConfig;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.GlobalExceptionHandler;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.service.ConsumerUnitGroupService;
import br.com.ampere.service.GroupParameters;
import br.com.ampere.service.GroupValidation;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.MessageSource;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.format.support.DefaultFormattingConversionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ConsumerUnitGroupControllerTest {

  private static final Project PROJECT =
      Project.draft(
          "Residencial Monte Verde",
          "Rodovia BR-101, km 8",
          "Cabo de Santo Agostinho",
          "2026-1001",
          new ResidentialMultifamily(
              12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
          List.of());

  @Test
  void savesAnIncompleteGroupAndAnswersWhatItLacks() throws Exception {
    ConsumerUnitGroupService service = mock(ConsumerUnitGroupService.class);
    when(service.create(eq(1L), any())).thenReturn(charging(null));

    mockMvc(service)
        .perform(
            post("/projects/1/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "kind": "EV_CHARGING",
                      "name": "Recarga de veículo elétrico",
                      "quantity": 6,
                      "powerPerPointKw": 7.4,
                      "incorporatedInVehicle": false,
                      "stationType": "COLLECTIVE"
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.kind").value("EV_CHARGING"))
        .andExpect(jsonPath("$.data.status").value("MISSING_DATA"))
        .andExpect(jsonPath("$.data.issues[0].severity").value("MISSING_DATA"))
        .andExpect(jsonPath("$.data.issues[0].field").value("loadManagement"))
        .andExpect(jsonPath("$.data.summary").value("6 pontos de 7,4 kW · DIS-NOR-053 Quadro 33"))
        .andExpect(jsonPath("$.data.declaredLoadKw").value(44.4))
        .andExpect(jsonPath("$.data.loadManagement").doesNotExist())
        .andExpect(jsonPath("$.data.items").doesNotExist())
        .andExpect(jsonPath("$.data.usefulArea").doesNotExist());

    ArgumentCaptor<GroupParameters> parameters = ArgumentCaptor.forClass(GroupParameters.class);
    verify(service).create(eq(1L), parameters.capture());
    assertThat(parameters.getValue().kind()).isEqualTo(GroupKind.EV_CHARGING);
    assertThat(parameters.getValue().spec().powerPerPointKw()).isEqualByComparingTo("7.4");
    assertThat(parameters.getValue().spec().loadManagement()).isNull();
    assertThat(parameters.getValue().spec().items()).isNull();
  }

  @Test
  void convertsTheLoadsOfALoadGroup() throws Exception {
    ConsumerUnitGroupService service = mock(ConsumerUnitGroupService.class);
    when(service.create(eq(1L), any())).thenReturn(charging(true));

    mockMvc(service)
        .perform(
            post("/projects/1/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "kind": "LOAD",
                      "name": "Área comum",
                      "quantity": 1,
                      "usage": "COMMON_AREA",
                      "items": [
                        { "category": "MOTORS", "description": "Elevador", "quantity": 1,
                          "power": 12, "powerUnit": "CV" }
                      ]
                    }
                    """))
        .andExpect(status().isCreated());

    ArgumentCaptor<GroupParameters> parameters = ArgumentCaptor.forClass(GroupParameters.class);
    verify(service).create(eq(1L), parameters.capture());
    assertThat(parameters.getValue().spec().items())
        .singleElement()
        .satisfies(item -> assertThat(item.getDescription()).isEqualTo("Elevador"));
  }

  @Test
  void rejectsAGroupWithoutKindNameOrQuantity() throws Exception {
    mockMvc(mock(ConsumerUnitGroupService.class))
        .perform(
            post("/projects/1/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"quantity\": 0 }"))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.errors[*].field").value(containsInAnyOrder("kind", "name", "quantity")));
  }

  @Test
  void rejectsALoadWithoutDescription() throws Exception {
    mockMvc(mock(ConsumerUnitGroupService.class))
        .perform(
            post("/projects/1/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "kind": "LOAD",
                      "name": "Área comum",
                      "quantity": 1,
                      "items": [{ "category": "MOTORS", "quantity": 1, "powerUnit": "CV" }]
                    }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors[0].field").value("items[0].description"));
  }

  @Test
  void answersTheValidationOfTheStep() throws Exception {
    ConsumerUnitGroupService service = mock(ConsumerUnitGroupService.class);
    when(service.validation(1L))
        .thenReturn(new GroupValidation(false, 2, 5, 55, new BigDecimal("452.00")));

    mockMvc(service)
        .perform(get("/projects/1/groups/validation"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.canCalculate").value(false))
        .andExpect(jsonPath("$.data.pendingCount").value(2))
        .andExpect(jsonPath("$.data.totalGroups").value(5))
        .andExpect(jsonPath("$.data.totalUnits").value(55))
        .andExpect(jsonPath("$.data.totalDeclaredLoadKw").value(452.00));
  }

  @Test
  void answersNotFoundForAnUnknownProject() throws Exception {
    ConsumerUnitGroupService service = mock(ConsumerUnitGroupService.class);
    when(service.list(99L)).thenThrow(new NotFoundException("Projeto não encontrado."));

    mockMvc(service)
        .perform(get("/projects/99/groups"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.detail").value("Projeto não encontrado."));
  }

  @Test
  void answersConflictOutsideADraftOrWhenTheKindChanges() throws Exception {
    ConsumerUnitGroupService service = mock(ConsumerUnitGroupService.class);
    when(service.update(eq(1L), eq(7L), any()))
        .thenThrow(
            new BusinessException(
                "O tipo de um grupo não muda. Exclua o grupo e cadastre outro.",
                HttpStatus.CONFLICT));
    doThrow(
            new BusinessException(
                "Só é possível alterar as unidades de um projeto em rascunho.",
                HttpStatus.CONFLICT))
        .when(service)
        .delete(1L, 8L);
    MockMvc mockMvc = mockMvc(service);

    mockMvc
        .perform(
            put("/projects/1/groups/7")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"kind\": \"LOAD\", \"name\": \"Área comum\", \"quantity\": 1 }"))
        .andExpect(status().isConflict());
    mockMvc.perform(delete("/projects/1/groups/8")).andExpect(status().isConflict());
  }

  @Test
  void answersNoContentWhenAGroupIsDeleted() throws Exception {
    mockMvc(mock(ConsumerUnitGroupService.class))
        .perform(delete("/projects/1/groups/7"))
        .andExpect(status().isNoContent())
        .andExpect(content().string(""));
  }

  private static ConsumerUnitGroup charging(Boolean loadManagement) {
    return GroupKind.EV_CHARGING.create(
        PROJECT,
        new GroupSpec(
            "Recarga de veículo elétrico",
            6,
            null,
            null,
            null,
            null,
            null,
            null,
            new BigDecimal("7.4"),
            false,
            loadManagement,
            EvStationType.COLLECTIVE));
  }

  /** Same basename Spring Boot registers in production. */
  private static MessageSource messageSource() {
    ResourceBundleMessageSource source = new ResourceBundleMessageSource();
    source.setBasename("messages");
    source.setDefaultEncoding("UTF-8");
    source.setUseCodeAsDefaultMessage(false);

    return source;
  }

  private static MockMvc mockMvc(ConsumerUnitGroupService service) {
    DefaultFormattingConversionService conversionService = new DefaultFormattingConversionService();
    new EnumParameterConfig().addFormatters(conversionService);

    return MockMvcBuilders.standaloneSetup(new ConsumerUnitGroupController(service))
        .setConversionService(conversionService)
        .setControllerAdvice(new GlobalExceptionHandler(messageSource()))
        .build();
  }
}
