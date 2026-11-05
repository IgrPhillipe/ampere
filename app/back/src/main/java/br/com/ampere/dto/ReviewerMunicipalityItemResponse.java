package br.com.ampere.dto;

import java.util.List;

public record ReviewerMunicipalityItemResponse(
    UserOptionResponse reviewer,
    List<MunicipalityAssignmentDto> municipalities) {}
