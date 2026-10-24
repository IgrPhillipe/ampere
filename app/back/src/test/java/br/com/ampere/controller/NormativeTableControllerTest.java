package br.com.ampere.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ampere.config.EnumParameterConfig;
import br.com.ampere.domain.NormativeTableSort;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.error.GlobalExceptionHandler;
import br.com.ampere.service.NormativeTableQuery;
import br.com.ampere.service.NormativeTableService;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.MessageSource;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.core.MethodParameter;
import org.springframework.format.support.DefaultFormattingConversionService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

class NormativeTableControllerTest {

  @Test
  void listsInCatalogueOrderWithoutParameters() throws Exception {
    NormativeTableService service = service();

    mockMvc(service).perform(get("/normative-tables")).andExpect(status().isOk());

    assertThat(queryOf(service)).isEqualTo(NormativeTableQuery.all());
  }

  @Test
  void bindsTheFiltersAndTheSort() throws Exception {
    NormativeTableService service = service();

    mockMvc(service)
        .perform(
            get("/normative-tables")
                .param("search", "quadro")
                .param("status", "DRAFT", "PUBLISHED")
                .param("sort", "verifiedAt")
                .param("direction", "DESC"))
        .andExpect(status().isOk());

    assertThat(queryOf(service))
        .isEqualTo(
            new NormativeTableQuery(
                "quadro",
                Set.of(NormativeTableStatus.DRAFT, NormativeTableStatus.PUBLISHED),
                NormativeTableSort.VERIFIED_AT,
                SortDirection.DESC));
  }

  @Test
  void dropsABlankStatus() throws Exception {
    NormativeTableService service = service();

    mockMvc(service)
        .perform(get("/normative-tables").param("status", "DRAFT,"))
        .andExpect(status().isOk());
    mockMvc(service)
        .perform(get("/normative-tables").param("status", "DRAFT", ""))
        .andExpect(status().isOk());

    verify(service, times(2))
        .list(
            eq(new NormativeTableQuery(null, Set.of(NormativeTableStatus.DRAFT), null, null)),
            any());
  }

  @Test
  void returnsTheAcceptedStatuses() throws Exception {
    mockMvc(service())
        .perform(get("/normative-tables").param("status", "ARCHIVED"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail", containsString("SUPERSEDED")));
  }

  @Test
  void returnsTheAcceptedSortColumns() throws Exception {
    mockMvc(service())
        .perform(get("/normative-tables").param("sort", "rows"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail", containsString("REGISTERED_AT")));
  }

  private static NormativeTableService service() {
    NormativeTableService service = mock(NormativeTableService.class);
    when(service.list(any(), any())).thenReturn(List.of());

    return service;
  }

  private static NormativeTableQuery queryOf(NormativeTableService service) {
    ArgumentCaptor<NormativeTableQuery> query = ArgumentCaptor.forClass(NormativeTableQuery.class);
    verify(service).list(query.capture(), any());

    return query.getValue();
  }

  private static MockMvc mockMvc(NormativeTableService service) {
    DefaultFormattingConversionService conversionService = new DefaultFormattingConversionService();
    new EnumParameterConfig().addFormatters(conversionService);

    return MockMvcBuilders.standaloneSetup(new NormativeTableController(service))
        .setConversionService(conversionService)
        .setCustomArgumentResolvers(adminToken())
        .setControllerAdvice(new GlobalExceptionHandler(messageSource()))
        .build();
  }

  /** Same basename Spring Boot registers in production. */
  private static MessageSource messageSource() {
    ResourceBundleMessageSource source = new ResourceBundleMessageSource();
    source.setBasename("messages");
    source.setDefaultEncoding("UTF-8");
    source.setUseCodeAsDefaultMessage(false);

    return source;
  }

  /** Standalone MockMvc has no security, so the admin's token is injected directly. */
  private static HandlerMethodArgumentResolver adminToken() {
    Jwt token =
        Jwt.withTokenValue("token")
            .header("alg", "none")
            .subject("1")
            .claim("role", "admin")
            .build();

    return new HandlerMethodArgumentResolver() {
      @Override
      public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType() == Jwt.class;
      }

      @Override
      public Object resolveArgument(
          MethodParameter parameter,
          ModelAndViewContainer container,
          NativeWebRequest request,
          WebDataBinderFactory binderFactory) {
        return token;
      }
    };
  }
}
