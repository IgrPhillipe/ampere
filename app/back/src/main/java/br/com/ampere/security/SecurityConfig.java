package br.com.ampere.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import javax.crypto.SecretKey;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Quem entra sem token e quem nao entra.
 *
 * <p>Aberto: o proprio login e a documentacao. Todo o resto exige token — era o que faltava para a
 * pendencia 15, que registrava os endpoints de projeto abertos a qualquer um.
 *
 * <p>Nenhuma rota e gateada por papel. Os papeis atuais sao placeholder ate a Q1c fechar, e gatear
 * por um placeholder seria inventar regra de negocio.
 */
@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

  /** Sem sessao e sem CSRF: o cliente e uma SPA que manda o token em cada requisicao. */
  @Bean
  public SecurityFilterChain filterChain(
      HttpSecurity http, ProblemDetailAuthenticationHandler handler) throws Exception {
    return http.csrf(csrf -> csrf.disable())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(HttpMethod.POST, "/auth/login")
                    .permitAll()
                    .requestMatchers("/docs/**", "/swagger-ui/**", "/v3/api-docs/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        // O handler precisa estar nos dois lugares: para token malformado ou
        // expirado quem responde e o entry point do proprio resource server, e o
        // do `exceptionHandling` nao chega a rodar. Sem os dois, sessao vencida
        // volta 401 de corpo vazio e o front cai na mensagem generica em vez de
        // dizer para entrar de novo.
        .oauth2ResourceServer(
            oauth2 ->
                oauth2
                    .jwt(Customizer.withDefaults())
                    .authenticationEntryPoint(handler)
                    .accessDeniedHandler(handler))
        .exceptionHandling(
            exceptions -> exceptions.authenticationEntryPoint(handler).accessDeniedHandler(handler))
        .build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /**
   * Uma chave so, resolvida uma vez.
   *
   * <p>Resolver dentro do codificador e do decodificador separadamente daria duas chaves aleatorias
   * diferentes quando {@code JWT_SECRET} nao esta definida, e nada do que fosse assinado seria
   * aceito de volta.
   */
  @Bean
  public SecretKey jwtSigningKey(JwtProperties properties, Environment environment) {
    return JwtSecret.resolve(properties.secret(), environment.matchesProfiles("prod"));
  }

  @Bean
  public JwtEncoder jwtEncoder(SecretKey jwtSigningKey) {
    return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSigningKey));
  }

  @Bean
  public JwtDecoder jwtDecoder(SecretKey jwtSigningKey) {
    return NimbusJwtDecoder.withSecretKey(jwtSigningKey).macAlgorithm(MacAlgorithm.HS256).build();
  }
}
