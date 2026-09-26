package br.com.ampere.service;

import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableRow;
import java.util.List;

public record NormativeTableParameters(
    NormativeTableCode code,
    String identification,
    String item,
    String page,
    List<NormativeTableRow> rows) {}
