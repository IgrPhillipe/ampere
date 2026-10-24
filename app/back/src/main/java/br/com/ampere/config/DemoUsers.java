package br.com.ampere.config;

import br.com.ampere.domain.User;

/** The accounts the scenarios hand projects and reviews to. */
record DemoUsers(
    User user, User carla, User joao, User admin, User bruno, User revisor, User ana) {}
