package br.com.ampere.security;

import br.com.ampere.domain.Project;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Central authorization policy for every resource nested under a project. */
@Component
public class ProjectAccessPolicy {

  private static final String NOT_FOUND = "Projeto não encontrado.";
  private static final String ADMIN_READ_ONLY =
      "O perfil analista possui acesso somente para leitura aos projetos enviados.";

  public void requireRead(Project project, AuthenticatedUser user) {
    if (user.isAdmin()) {
      if (project.getSubmittedAt() == null) {
        throw new NotFoundException(NOT_FOUND);
      }
      return;
    }

    requireOwnership(project, user);
  }

  public void requireWrite(Project project, AuthenticatedUser user) {
    requireProjectWrite(user);

    requireOwnership(project, user);
  }

  public void requireProjectWrite(AuthenticatedUser user) {
    if (user.isAdmin()) {
      throw new BusinessException(ADMIN_READ_ONLY, HttpStatus.FORBIDDEN);
    }
  }

  private static void requireOwnership(Project project, AuthenticatedUser user) {
    if (!project.belongsTo(user.id(), user.email())) {
      // Do not reveal that another project exists for the supplied identifier.
      throw new NotFoundException(NOT_FOUND);
    }
  }
}
