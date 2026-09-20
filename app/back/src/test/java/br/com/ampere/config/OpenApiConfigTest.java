package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.controller.ProjectController;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.ProjectRequest;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.junit.jupiter.api.Test;

class OpenApiConfigTest {

  @Test
  void definesAmpereApiMetadata() {
    OpenAPIDefinition definition = OpenApiConfig.class.getAnnotation(OpenAPIDefinition.class);

    assertThat(definition.info().title()).isEqualTo("AMPERE API");
    assertThat(definition.info().version()).isEqualTo("v1");
  }

  @Test
  void documentsProjectListingWithStableNames() throws NoSuchMethodException {
    Tag tag = ProjectController.class.getAnnotation(Tag.class);
    Operation operation =
        ProjectController.class
            .getMethod("list", PageQuery.class, ProjectStatus.class, String.class)
            .getAnnotation(Operation.class);

    assertThat(tag.name()).isEqualTo("Projects");
    assertThat(operation.operationId()).isEqualTo("listProjects");
  }

  @Test
  void documentsTheProjectCrudWithStableNames() throws NoSuchMethodException {
    assertThat(operationId("create", ProjectRequest.class)).isEqualTo("createProject");
    assertThat(operationId("detail", Long.class)).isEqualTo("getProject");
    assertThat(operationId("update", Long.class, ProjectRequest.class)).isEqualTo("updateProject");
    assertThat(operationId("delete", Long.class)).isEqualTo("deleteProject");
  }

  private static String operationId(String method, Class<?>... parameters)
      throws NoSuchMethodException {
    return ProjectController.class
        .getMethod(method, parameters)
        .getAnnotation(Operation.class)
        .operationId();
  }
}
