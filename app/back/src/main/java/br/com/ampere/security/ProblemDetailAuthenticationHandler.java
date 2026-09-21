package br.com.ampere.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
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

  private final ObjectMapper objectMapper;

  public ProblemDetailAuthenticationHandler(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public void commence(
      HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
      throws IOException {
    write(request, response, HttpStatus.UNAUTHORIZED, UNAUTHENTICATED_MESSAGE);
  }

  @Override
  public void handle(
      HttpServletRequest request, HttpServletResponse response, AccessDeniedException exception)
      throws IOException {
    write(request, response, HttpStatus.FORBIDDEN, FORBIDDEN_MESSAGE);
  }

  private void write(
      HttpServletRequest request, HttpServletResponse response, HttpStatus status, String detail)
      throws IOException {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
    problem.setInstance(java.net.URI.create(request.getRequestURI()));

    response.setStatus(status.value());
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");
    response.getWriter().write(objectMapper.writeValueAsString(problem));
  }
}
