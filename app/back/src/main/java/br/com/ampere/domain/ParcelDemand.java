package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/** One parcel of DIS-NOR-030 item 6.27 inside a load group. */
public record ParcelDemand(
    LoadCategory category,
    BigDecimal kva,
    List<String> lines,
    List<NormativeReference> references) {}
