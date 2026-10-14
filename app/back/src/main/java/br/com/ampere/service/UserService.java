package br.com.ampere.service;

import br.com.ampere.domain.User;
import br.com.ampere.dto.AuthUserResponse;
import br.com.ampere.dto.ChangePasswordRequest;
import br.com.ampere.dto.LoginResponse;
import br.com.ampere.dto.ProfileRequest;
import br.com.ampere.dto.ProfileResponse;
import br.com.ampere.dto.RegisterRequest;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.security.TokenService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Sign-up and the designer's own profile. */
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

  /** Always the designer role: analysts are created by the administrator. */
  @Transactional
  public LoginResponse register(RegisterRequest request) {
    if (userRepository.findByEmail(request.email()).isPresent()) {
      throw new BusinessException(EMAIL_TAKEN, HttpStatus.CONFLICT);
    }

    User user =
        User.designer(
            request.name(),
            request.email(),
            passwordEncoder.encode(request.password()),
            request.crea(),
            request.creaState(),
            request.company(),
            request.phone());
    try {
      user = userRepository.saveAndFlush(user);
    } catch (DataIntegrityViolationException race) {
      throw new BusinessException(EMAIL_TAKEN, HttpStatus.CONFLICT);
    }

    return new LoginResponse(tokenService.issue(user), AuthUserResponse.from(user));
  }

  @Transactional(readOnly = true)
  public ProfileResponse profile(String userId) {
    return ProfileResponse.from(find(userId));
  }

  @Transactional
  public ProfileResponse updateProfile(String userId, ProfileRequest request) {
    User user = find(userId);
    user.updateProfile(
        request.name(), request.crea(), request.creaState(), request.company(), request.phone());

    return ProfileResponse.from(user);
  }

  @Transactional
  public void changePassword(String userId, ChangePasswordRequest request) {
    User user = find(userId);
    if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
      throw new BusinessException(
          "A senha atual está incorreta.", HttpStatus.UNPROCESSABLE_CONTENT);
    }

    user.changePasswordHash(passwordEncoder.encode(request.newPassword()));
  }

  private User find(String userId) {
    Long id;
    try {
      id = Long.valueOf(userId);
    } catch (NumberFormatException exception) {
      throw new BusinessException("Sessão inválida. Entre novamente.", HttpStatus.UNAUTHORIZED);
    }

    return userRepository
        .findById(id)
        .orElseThrow(
            () ->
                new BusinessException(
                    "A sessão aponta para um usuário que não existe mais.",
                    HttpStatus.UNAUTHORIZED));
  }
}
