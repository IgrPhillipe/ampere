package br.com.ampere.service;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.User;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.security.AuthenticatedUser;
import br.com.ampere.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectReviewService {

  private static final String ANALYST_ONLY = "Somente analistas podem assumir uma análise.";
  private static final String USER_NOT_FOUND = "Usuário autenticado não encontrado.";

  private final ProjectService projectService;
  private final UserRepository userRepository;
  private final CurrentUser currentUser;

  public ProjectReviewService(
      ProjectService projectService, UserRepository userRepository, CurrentUser currentUser) {
    this.projectService = projectService;
    this.userRepository = userRepository;
    this.currentUser = currentUser;
  }

  @Transactional
  public Project assign(Long projectId) {
    AuthenticatedUser actor = requireAnalyst();
    Project project = projectService.findById(projectId);
    User reviewer =
        userRepository
            .findById(actor.id())
            .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND));

    try {
      project.assignReviewer(reviewer);
    } catch (IllegalStateException invalidAssignment) {
      throw new BusinessException(assignmentMessage(project), HttpStatus.CONFLICT);
    }

    return project;
  }

  AuthenticatedUser requireAnalyst() {
    AuthenticatedUser actor = currentUser.get();
    if (!actor.isAdmin()) {
      throw new BusinessException(ANALYST_ONLY, HttpStatus.FORBIDDEN);
    }
    return actor;
  }

  Project assignedProject(Long projectId) {
    AuthenticatedUser actor = requireAnalyst();
    Project project = projectService.findById(projectId);
    if (!project.isAssignedTo(actor.id())) {
      throw new BusinessException(
          "Somente o analista responsável pode alterar esta análise.", HttpStatus.FORBIDDEN);
    }
    return project;
  }

  private static String assignmentMessage(Project project) {
    return project.getReviewer() == null
        ? "Somente projetos em análise podem ser atribuídos."
        : "Este projeto já foi assumido por outro analista.";
  }
}
