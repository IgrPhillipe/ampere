package br.com.ampere.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
@EnableConfigurationProperties(SigningProperties.class)
public class SigningConfig {

  @Bean
  public SigningCredentials signingCredentials(
      SigningProperties properties, Environment environment) {
    return SigningCredentials.resolve(properties, environment.matchesProfiles("prod"));
  }
}
