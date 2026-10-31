package br.com.ampere.service;

import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.utils.SearchTerms;
import br.com.ampere.utils.TemporaryPasswords;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** There is no e-mail: the administrator hands the temporary password over. */
@Service
public class UserAdministrationService {

  private final UserRepository userRepository;
  private final ProjectRepository projectRepository;
  private final PasswordEncoder passwordEncoder;

  public UserAdministrationService(
      UserRepository userRepository,
      ProjectRepository projectRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional(readOnly = true)
  public UserListing list(
      int page,
      int pageSize,
      String search,
      UserRole role,
      Boolean active,
      AuthenticatedUser administrator) {
    administrator.requireAdmin();
    PageRequest pageRequest =
        PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.ASC, "name").and(Sort.by("id")));
    Page<User> users =
        userRepository.search(role, active, SearchTerms.normalize(search), pageRequest);

    return new UserListing(users.getContent(), users.getTotalElements());
  }

  @Transactional
  public TemporaryAccess create(
      String email, UserParameters parameters, AuthenticatedUser administrator) {
    administrator.requireAdmin();
    if (userRepository.findByEmail(email).isPresent()) {
      throw new BusinessException(UserService.EMAIL_TAKEN, HttpStatus.CONFLICT);
    }

    String temporaryPassword = TemporaryPasswords.generate();
    User user =
        User.withTemporaryPassword(
            parameters.name(), email, passwordEncoder.encode(temporaryPassword), parameters.role());
    try {
      user = userRepository.saveAndFlush(user);
    } catch (DataIntegrityViolationException race) {
      throw new BusinessException(UserService.EMAIL_TAKEN, HttpStatus.CONFLICT);
    }

    return new TemporaryAccess(user, temporaryPassword);
  }

  /** The administrator cannot lock themself out, by deactivation or by losing the role. */
  @Transactional
  public User update(
      Long id, UserParameters parameters, boolean active, AuthenticatedUser administrator) {
    administrator.requireAdmin();
    User user = find(id);
    if (user.getId().equals(administrator.id())) {
      if (!active) {
        throw new BusinessException("Você não pode desativar a própria conta.");
      }

      if (parameters.role() != UserRole.ADMIN) {
        throw new BusinessException("Você não pode remover o próprio papel de administrador.");
      }
    }

    if (parameters.role() != user.getRole()) {
      ongoingWorkOrFail(user, parameters.role());
    }

    user.administer(parameters.name(), parameters.role(), active);

    return user;
  }

  @Transactional
  public TemporaryAccess resetPassword(Long id, AuthenticatedUser administrator) {
    administrator.requireAdmin();
    User user = find(id);
    String temporaryPassword = TemporaryPasswords.generate();
    user.resetPassword(passwordEncoder.encode(temporaryPassword));

    return new TemporaryAccess(user, temporaryPassword);
  }

  /** A new role would orphan the projects the designer still owns or the reviews in progress. */
  private void ongoingWorkOrFail(User user, UserRole role) {
    if (user.getRole() == UserRole.USER
        && projectRepository.existsByOwnerIdAndStatusNot(user.getId(), ProjectStatus.APPROVED)) {
      throw new BusinessException(
          "Este projetista tem projetos em andamento. Conclua-os antes de mudar o papel.",
          HttpStatus.CONFLICT);
    }
    if (user.getRole().canReview()
        && !role.canReview()
        && projectRepository.existsByReviewerIdAndStatus(
            user.getId(), ProjectStatus.UNDER_REVIEW)) {
      throw new BusinessException(
          "Este analista tem análises em andamento. Conclua-as antes de mudar o papel.",
          HttpStatus.CONFLICT);
    }
  }

  private User find(Long id) {
    return userRepository
        .findById(id)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
  }
}
