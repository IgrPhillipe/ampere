package br.com.ampere.service;

import br.com.ampere.domain.User;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.UserRepository;

/** The {@code reviewer} filter: an analyst's id, or {@link #UNASSIGNED} for no analyst yet. */
record ReviewerFilter(Long reviewerId, boolean unassigned) {

  /** {@code reviewer} value for the projects the manager has not assigned yet. */
  static final String UNASSIGNED = "none";

  static final ReviewerFilter ANY = new ReviewerFilter(null, false);

  static ReviewerFilter of(String value, UserRepository userRepository) {
    String reviewer = value == null ? "" : value.trim();
    if (reviewer.isEmpty()) {
      return ANY;
    }
    if (UNASSIGNED.equalsIgnoreCase(reviewer)) {
      return new ReviewerFilter(null, true);
    }

    return new ReviewerFilter(analystId(reviewer, userRepository), false);
  }

  private static Long analystId(String reviewer, UserRepository userRepository) {
    long id;
    try {
      id = Long.parseLong(reviewer);
    } catch (NumberFormatException exception) {
      throw new BusinessException("Identificador de analista inválido.");
    }

    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("Analista informado não encontrado."));
    if (!user.getRole().canReview()) {
      throw new BusinessException("O usuário informado não é um analista.");
    }

    return id;
  }
}
