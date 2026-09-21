package br.com.ampere.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info =
        @Info(
            title = "AMPERE API",
            version = "v1",
            description = "API e motor de cálculo de demanda elétrica do AMPERE"))
public class OpenApiConfig {}
