package br.com.ampere.service;

import br.com.ampere.domain.User;
import br.com.ampere.dto.AuthUserResponse;
import br.com.ampere.dto.LoginRequest;
import br.com.ampere.dto.LoginResponse;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.UserRepository;
import br.com.ampere.security.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Autenticacao: conferir credencial e emitir token. */
@Service
public class AuthService {

  /** Mensagem unica para e-mail inexistente e senha errada. */
  private static final String INVALID_CREDENTIALS = "E-mail ou senha inválidos.";

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final TokenService tokenService;

  public AuthService(
      UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.tokenService = tokenService;
  }

  @Transactional(readOnly = true)
  public LoginResponse login(LoginRequest request) {
    User user =
        userRepository
            .findByEmail(User.normalizeEmail(request.email()))
            .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
            .orElseThrow(() -> new BusinessException(INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED));

    return new LoginResponse(tokenService.issue(user), AuthUserResponse.from(user));
  }

  /** O usuario do token, relido do banco. */
  @Transactional(readOnly = true)
  public AuthUserResponse currentUser(String userId) {
    return userRepository
        .findById(parseId(userId))
        .map(AuthUserResponse::from)
        .orElseThrow(
            () ->
                new BusinessException(
                    "A sessão aponta para um usuário que não existe mais.",
                    HttpStatus.UNAUTHORIZED));
  }

  private static Long parseId(String userId) {
    try {
      return Long.valueOf(userId);
    } catch (NumberFormatException exception) {
      throw new BusinessException("Sessão inválida. Entre novamente.", HttpStatus.UNAUTHORIZED);
    }
  }
}
