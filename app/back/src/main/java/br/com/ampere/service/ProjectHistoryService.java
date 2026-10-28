package br.com.ampere.service;

import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.repository.ProjectEventRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectHistoryService {

  private final ProjectService projectService;
  private final ProjectEventRepository eventRepository;

  public ProjectHistoryService(
      ProjectService projectService, ProjectEventRepository eventRepository) {
    this.projectService = projectService;
    this.eventRepository = eventRepository;
  }

  @Transactional(readOnly = true)
  public List<ProjectEvent> events(
      Long projectId, SortDirection direction, AuthenticatedUser user) {
    projectService.findById(projectId, user);

    return direction == SortDirection.ASC
        ? eventRepository.findAllByProjectIdOrderByOccurredAtAscIdAsc(projectId)
        : eventRepository.findAllByProjectIdOrderByOccurredAtDescIdDesc(projectId);
  }
}
