package br.com.ampere.service;

import br.com.ampere.domain.User;
import br.com.ampere.repository.UserRepository;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Turns the e-mails stored as authorship into the names people know each other by. */
@Service
public class PersonDirectory {

  private final UserRepository userRepository;

  public PersonDirectory(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public PersonNames namesOf(Collection<String> emails) {
    Set<String> folded =
        emails.stream()
            .filter(Objects::nonNull)
            .map(User::normalizeEmail)
            .collect(Collectors.toSet());
    if (folded.isEmpty()) {
      return PersonNames.none();
    }

    return new PersonNames(
        userRepository.findAllByEmailIn(folded).stream()
            .collect(
                Collectors.toMap(
                    UserRepository.PersonName::getEmail, UserRepository.PersonName::getName)));
  }
}
