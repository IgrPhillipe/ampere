package br.com.ampere.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
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
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.ProjectResponse;
import br.com.ampere.dto.ProjectStatusCounts;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.GlobalExceptionHandler;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.service.ProjectListing;
import br.com.ampere.service.ProjectService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.context.MessageSource;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.format.support.DefaultFormattingConversionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ProjectControllerTest {

  @Test
  void rejectsInvalidPaginationParameters() throws Exception {
    ProjectService service = mock(ProjectService.class);
    MockMvc mockMvc = mockMvc(service);

    mockMvc.perform(get("/projects").param("page", "abc")).andExpect(status().isBadRequest());
    mockMvc.perform(get("/projects").param("page", "0")).andExpect(status().isBadRequest());
    mockMvc.perform(get("/projects").param("pageSize", "101")).andExpect(status().isBadRequest());
  }

  @Test
  void returnsAcceptedValuesForInvalidStatus() throws Exception {
    MockMvc mockMvc = mockMvc(mock(ProjectService.class));

    mockMvc
        .perform(get("/projects").param("status", "unknown"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail", containsString("DRAFT")))
        .andExpect(jsonPath("$.detail", containsString("APPROVED")));
  }

  @Test
  void wrapsProjectListingAndPaginationInApiResponse() {
    Project project = mock(Project.class);
    when(project.getId()).thenReturn(42L);
    when(project.getName()).thenReturn("Condomínio Vila Nova");
    when(project.getAddress()).thenReturn("Avenida Barreto de Menezes, 88");
    when(project.getMunicipality()).thenReturn("Jaboatão dos Guararapes");
    when(project.getProtocol()).thenReturn("2026-8475");
    when(project.getStatus()).thenReturn(ProjectStatus.REJECTED);
    when(project.getCreatedAt())
        .thenReturn(OffsetDateTime.of(2026, 9, 12, 0, 0, 0, 0, ZoneOffset.UTC));
    when(project.getUpdatedAt())
        .thenReturn(OffsetDateTime.of(2026, 9, 17, 0, 0, 0, 0, ZoneOffset.UTC));

    ProjectService service = mock(ProjectService.class);
    ProjectListing listing =
        new ProjectListing(
            List.of(project),
            1,
            Map.of(42L, 3L),
            Map.of(42L, 55L),
            Map.of(42L, new BigDecimal("165.00")));
    when(service.list(1, 20, ProjectStatus.REJECTED, "vila")).thenReturn(listing);
    ProjectController controller = new ProjectController(service);

    ApiResponse<List<ProjectResponse>> response =
        controller.list(new PageQuery(1, 20), ProjectStatus.REJECTED, "vila");

    assertThat(response.data()).hasSize(1);
    assertThat(response.data().getFirst().id()).isEqualTo("42");
    assertThat(response.data().getFirst().pendingCount()).isEqualTo(3);
    assertThat(response.data().getFirst().consumerUnitsCount()).isEqualTo(55);
    assertThat(response.data().getFirst().demandKva()).isEqualByComparingTo("165");
    assertThat(response.pagination().total()).isOne();
    assertThat(response.pagination().page()).isOne();
    assertThat(response.pagination().pageSize()).isEqualTo(20);
  }

  @Test
  void exposesGlobalStatusCountsOnItsOwnEndpoint() {
    ProjectService service = mock(ProjectService.class);
    when(service.countPerStatus())
        .thenReturn(Map.of(ProjectStatus.REJECTED, 2L, ProjectStatus.APPROVED, 1L));

    ApiResponse<ProjectStatusCounts> response = new ProjectController(service).statusCounts();

    assertThat(response.data().total()).isEqualTo(3);
    assertThat(response.data().rejected()).isEqualTo(2);
    assertThat(response.data().approved()).isOne();
    assertThat(response.data().draft()).isZero();
    assertThat(response.pagination()).isNull();
  }

  @Test
  void createsProjectAndAnswersCreated() throws Exception {
    ProjectService service = mock(ProjectService.class);
    when(service.create(any())).thenReturn(draft());

    mockMvc(service)
        .perform(post("/projects").contentType(MediaType.APPLICATION_JSON).content(validBody()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.protocol").value("2026-1007"))
        .andExpect(jsonPath("$.data.status").value("DRAFT"))
        .andExpect(jsonPath("$.data.buildingType").value("RESIDENTIAL_MULTIFAMILY"))
        .andExpect(jsonPath("$.data.floors").value(12))
        .andExpect(
            jsonPath("$.data.applicableStandards").value("DIS-NOR-053 REV 06 e DIS-NOR-030 REV 07"))
        .andExpect(jsonPath("$.data.demandRules", hasSize(2)));
  }

  @Test
  void rejectsCreationWithoutTheRequiredFields() throws Exception {
    mockMvc(mock(ProjectService.class))
        .perform(post("/projects").contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.errors[*].field")
                .value(
                    containsInAnyOrder(
                        "name",
                        "address",
                        "municipality",
                        "buildingType",
                        "floors",
                        "voltage",
                        "connectionType",
                        "entranceStandard")));
  }

  @Test
  void rejectsAnInvalidBuildingTypeInTheBody() throws Exception {
    String body = validBody().replace("RESIDENTIAL_MULTIFAMILY", "residencial coletivo");

    mockMvc(mock(ProjectService.class))
        .perform(post("/projects").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail", containsString("buildingType")))
        .andExpect(jsonPath("$.detail", containsString("RESIDENTIAL_MULTIFAMILY")))
        .andExpect(jsonPath("$.detail", containsString("MIXED")));
  }

  @Test
  void rejectsAMalformedJsonBody() throws Exception {
    mockMvc(mock(ProjectService.class))
        .perform(post("/projects").contentType(MediaType.APPLICATION_JSON).content("{\"name\":"))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.detail").value("Corpo da requisição inválido. Verifique o JSON enviado."));
  }

  @Test
  void answersNotFoundForAnUnknownProject() throws Exception {
    ProjectService service = mock(ProjectService.class);
    when(service.findById(99L)).thenThrow(new NotFoundException("Projeto não encontrado."));

    mockMvc(service)
        .perform(get("/projects/99"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.detail").value("Projeto não encontrado."));
  }

  @Test
  void answersConflictWhenTheProjectIsNoLongerADraft() throws Exception {
    ProjectService service = mock(ProjectService.class);
    when(service.update(eq(1L), any()))
        .thenThrow(
            new BusinessException(
                "Só é possível alterar um projeto em rascunho.", HttpStatus.CONFLICT));
    doThrow(
            new BusinessException(
                "Só é possível excluir um projeto em rascunho.", HttpStatus.CONFLICT))
        .when(service)
        .delete(1L);
    MockMvc mockMvc = mockMvc(service);

    mockMvc
        .perform(put("/projects/1").contentType(MediaType.APPLICATION_JSON).content(validBody()))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("Só é possível alterar um projeto em rascunho."));
    mockMvc
        .perform(delete("/projects/1"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("Só é possível excluir um projeto em rascunho."));
  }

  @Test
  void answersNoContentWhenADraftIsDeleted() throws Exception {
    mockMvc(mock(ProjectService.class))
        .perform(delete("/projects/1"))
        .andExpect(status().isNoContent())
        .andExpect(content().string(""));
  }

  @Test
  void rejectsANonNumericIdentifier() throws Exception {
    mockMvc(mock(ProjectService.class))
        .perform(get("/projects/abc"))
        .andExpect(status().isBadRequest());
  }

  private static String validBody() {
    return """
        {
          "name": "Residencial Monte Verde",
          "address": "Rodovia BR-101, km 8",
          "municipality": "Cabo de Santo Agostinho",
          "buildingType": "RESIDENTIAL_MULTIFAMILY",
          "floors": 12,
          "voltage": "V380_220",
          "connectionType": "THREE_PHASE",
          "entranceStandard": "COLLECTIVE"
        }
        """;
  }

  private static Project draft() {
    return Project.draft(
        "Residencial Monte Verde",
        "Rodovia BR-101, km 8",
        "Cabo de Santo Agostinho",
        "2026-1007",
        new ResidentialMultifamily(
            12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        List.of(new Standard("DIS-NOR-030", "REV 07"), new Standard("DIS-NOR-053", "REV 06")));
  }

  /** Same basename Spring Boot registers in production. */
  private static MessageSource messageSource() {
    ResourceBundleMessageSource source = new ResourceBundleMessageSource();
    source.setBasename("messages");
    source.setDefaultEncoding("UTF-8");
    source.setUseCodeAsDefaultMessage(false);

    return source;
  }

  private static MockMvc mockMvc(ProjectService service) {
    DefaultFormattingConversionService conversionService = new DefaultFormattingConversionService();
    new EnumParameterConfig().addFormatters(conversionService);

    return MockMvcBuilders.standaloneSetup(new ProjectController(service))
        .setConversionService(conversionService)
        .setControllerAdvice(new GlobalExceptionHandler(messageSource()))
        .build();
  }
}
