package br.com.ampere.dto;

import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.PowerUnit;
import java.math.BigDecimal;

public record LoadItemResponse(
    LoadCategory category,
    String description,
    Integer quantity,
    BigDecimal power,
    PowerUnit powerUnit,
    LampTechnology lampTechnology,
    Boolean simultaneousStart) {

  public static LoadItemResponse from(LoadItem item) {
    return new LoadItemResponse(
        item.getCategory(),
        item.getDescription(),
        item.getQuantity(),
        item.getPower(),
        item.getPowerUnit(),
        item.getLampTechnology(),
        item.getSimultaneousStart());
  }
}
