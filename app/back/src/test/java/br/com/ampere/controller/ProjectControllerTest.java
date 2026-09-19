package br.com.ampere.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.ProjectListResponse;
import br.com.ampere.error.GlobalExceptionHandler;
import br.com.ampere.service.ProjectService;
import br.com.ampere.service.ProjectService.ProjectListing;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ProjectControllerTest {

  @Test
  void rejectsInvalidPaginationParameters() throws Exception {
    ProjectService service = mock(ProjectService.class);
    MockMvc mockMvc =
        MockMvcBuilders.standaloneSetup(new ProjectController(service))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    mockMvc.perform(get("/projects").param("page", "abc")).andExpect(status().isBadRequest());
    mockMvc.perform(get("/projects").param("page", "0")).andExpect(status().isBadRequest());
    mockMvc
        .perform(get("/projects").param("pageSize", "101"))
        .andExpect(status().isBadRequest());
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
    when(project.getUpdatedAt()).thenReturn(LocalDateTime.of(2026, 9, 17, 0, 0));

    ProjectService service = mock(ProjectService.class);
    ProjectListing listing =
        new ProjectListing(
            List.of(project),
            1,
            Map.of(42L, 3L),
            Map.of(ProjectStatus.REJECTED, 2L, ProjectStatus.APPROVED, 1L));
    when(service.list(1, 20, "REJECTED", "vila")).thenReturn(listing);
    ProjectController controller = new ProjectController(service);

    ApiResponse<ProjectListResponse> response =
        controller.list(new PageQuery(1, 20), "REJECTED", "vila");

    assertThat(response.data().projects()).hasSize(1);
    assertThat(response.data().projects().getFirst().id()).isEqualTo("42");
    assertThat(response.data().projects().getFirst().pendingCount()).isEqualTo(3);
    assertThat(response.data().statusCounts().total()).isEqualTo(3);
    assertThat(response.data().statusCounts().draft()).isZero();
    assertThat(response.data().statusCounts().rejected()).isEqualTo(2);
    assertThat(response.data().statusCounts().approved()).isOne();
    assertThat(response.pagination().total()).isOne();
    assertThat(response.pagination().page()).isOne();
    assertThat(response.pagination().pageSize()).isEqualTo(20);
  }
}
