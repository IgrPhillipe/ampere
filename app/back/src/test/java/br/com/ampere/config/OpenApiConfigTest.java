package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.controller.ProjectController;
import br.com.ampere.dto.PageQuery;
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
            .getMethod("list", PageQuery.class, String.class, String.class)
            .getAnnotation(Operation.class);

    assertThat(tag.name()).isEqualTo("Projects");
    assertThat(operation.operationId()).isEqualTo("listProjects");
  }
}
