package br.com.ampere.controller;

import br.com.ampere.domain.Project;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ProjectRequest;
import br.com.ampere.dto.ProjectResponse;
import br.com.ampere.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

  private final ProjectService projectService;

  public ProjectController(ProjectService projectService) {
    this.projectService = projectService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
    Project project = projectService.createProject(request);
    return ApiResponse.of(new ProjectResponse(project));
  }
}
