package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.Pagination;
import br.com.ampere.dto.ProjectListResponse;
import br.com.ampere.dto.ProjectResponse;
import br.com.ampere.dto.ProjectStatusCounts;
import br.com.ampere.service.ProjectService;
import br.com.ampere.service.ProjectService.ProjectListing;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** HTTP endpoints for electrical projects. */
@RestController
@RequestMapping("/projects")
public class ProjectController {

  private final ProjectService service;

  public ProjectController(ProjectService service) {
    this.service = service;
  }

  @GetMapping
  public ApiResponse<ProjectListResponse> list(
      @Valid PageQuery pagination,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String search) {
    ProjectListing listing = service.list(pagination.page(), pagination.pageSize(), status, search);
    List<ProjectResponse> projects =
        listing.projects().stream()
            .map(project -> ProjectResponse.from(project, listing.pendingCountFor(project)))
            .toList();

    return ApiResponse.of(
        new ProjectListResponse(projects, ProjectStatusCounts.from(listing.statusCounts())),
        new Pagination(listing.totalElements(), pagination.page(), pagination.pageSize()));
  }
}
