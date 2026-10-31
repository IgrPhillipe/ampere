package br.com.ampere.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
public class ProblemDetailAuthenticationHandler
    implements AuthenticationEntryPoint, AccessDeniedHandler {

  static final String UNAUTHENTICATED_MESSAGE = "Sessão expirada ou inexistente. Entre novamente.";
  static final String FORBIDDEN_MESSAGE = "Você não tem permissão para acessar este recurso.";
  static final String PASSWORD_CHANGE_REQUIRED_MESSAGE =
      "Troque a senha temporária para continuar.";

  /** Lets the client tell this refusal from a missing permission and open the change. */
  static final String PASSWORD_CHANGE_REQUIRED_CODE = "PASSWORD_CHANGE_REQUIRED";

  private final ObjectMapper objectMapper;

  public ProblemDetailAuthenticationHandler(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public void commence(
      HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
      throws IOException {
    // A deactivated account says so, instead of looking like an expired session.
    String detail =
        exception instanceof DisabledException ? exception.getMessage() : UNAUTHENTICATED_MESSAGE;
    write(request, response, HttpStatus.UNAUTHORIZED, detail);
  }

  @Override
  public void handle(
      HttpServletRequest request, HttpServletResponse response, AccessDeniedException exception)
      throws IOException {
    write(request, response, HttpStatus.FORBIDDEN, FORBIDDEN_MESSAGE);
  }

  void requirePasswordChange(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, PASSWORD_CHANGE_REQUIRED_MESSAGE);
    problem.setProperty("code", PASSWORD_CHANGE_REQUIRED_CODE);
    write(request, response, problem);
  }

  private void write(
      HttpServletRequest request, HttpServletResponse response, HttpStatus status, String detail)
      throws IOException {
    write(request, response, ProblemDetail.forStatusAndDetail(status, detail));
  }

  private void write(
      HttpServletRequest request, HttpServletResponse response, ProblemDetail problem)
      throws IOException {
    problem.setInstance(java.net.URI.create(request.getRequestURI()));

    response.setStatus(problem.getStatus());
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");
    response.getWriter().write(objectMapper.writeValueAsString(problem));
  }
}
