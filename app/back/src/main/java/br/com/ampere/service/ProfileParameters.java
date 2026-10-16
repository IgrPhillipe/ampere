package br.com.ampere.service;

/** The professional data of a person, already converted. The service does not know about DTOs. */
public record ProfileParameters(
    String name, String crea, String creaState, String company, String phone) {}
