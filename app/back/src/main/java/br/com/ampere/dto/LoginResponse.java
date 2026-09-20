package br.com.ampere.dto;

/** Token plus the person it belongs to, matching the front's {@code loginResponseSchema}. */
public record LoginResponse(String token, AuthUserResponse user) {}
