package br.com.ampere.service;

import br.com.ampere.dto.AdminDashboardResponse;

public record AdminDashboard(AdminDashboardResponse response) {
  public AdminDashboardResponse toResponse() {
    return response;
  }
}
