package br.com.ampere.dto;

import java.util.List;

/** Content returned by the project listing endpoint. */
public record ProjectListResponse(
    List<ProjectResponse> projects, ProjectStatusCounts statusCounts) {}
