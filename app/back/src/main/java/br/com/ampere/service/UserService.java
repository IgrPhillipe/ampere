package br.com.ampere.service;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.security.TokenService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Sign-up and the profile of whoever is signed in. */
@Service
public class UserService {

  static final String EMAIL_TAKEN = "Já existe uma conta com este e-mail.";

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final TokenService tokenService;

  public UserService(
      UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.tokenService = tokenService;
  }

  /** Always the designer role: analysts are created by the administrator. Signs in like login. */
  @Transactional
  public SignIn register(String email, String password, ProfileParameters profile) {
    if (userRepository.findByEmail(email).isPresent()) {
      throw new BusinessException(EMAIL_TAKEN, HttpStatus.CONFLICT);
    }

    User user =
        User.designer(
            profile.name(),
            email,
            passwordEncoder.encode(password),
            profile.crea(),
            profile.creaState(),
            profile.company(),
            profile.phone());
    try {
      user = userRepository.saveAndFlush(user);
    } catch (DataIntegrityViolationException race) {
      throw new BusinessException(EMAIL_TAKEN, HttpStatus.CONFLICT);
    }

    return new SignIn(tokenService.issue(user), user);
  }

  @Transactional(readOnly = true)
  public User profile(AuthenticatedUser user) {
    return find(user);
  }

  /** The CREA identifies the technical responsible, so a designer cannot leave it empty. */
  @Transactional
  public User updateProfile(ProfileParameters profile, AuthenticatedUser user) {
    User person = find(user);
    if (person.getRole() == UserRole.USER
        && (isBlank(profile.crea()) || isBlank(profile.creaState()))) {
      throw new BusinessException("Informe o número do CREA e a UF.");
    }

    person.updateProfile(
        profile.name(), profile.crea(), profile.creaState(), profile.company(), profile.phone());

    return person;
  }

  @Transactional
  public void changePassword(String currentPassword, String newPassword, AuthenticatedUser user) {
    User person = find(user);
    if (!passwordEncoder.matches(currentPassword, person.getPasswordHash())) {
      throw new BusinessException(
          "A senha atual está incorreta.", HttpStatus.UNPROCESSABLE_CONTENT);
    }

    person.changePasswordHash(passwordEncoder.encode(newPassword));
  }

  private User find(AuthenticatedUser user) {
    return userRepository
        .findById(user.id())
        .orElseThrow(
            () ->
                new BusinessException(
                    "A sessão aponta para um usuário que não existe mais.",
                    HttpStatus.UNAUTHORIZED));
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
