package com.example.shoestore.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ImportRequest {
    @NotNull
    private Integer supplierId;

    @NotNull
    private List<ImportItemRequest> items;

    @Data
    public static class ImportItemRequest {
        private Integer variantId;
        private Integer quantity;
        private java.math.BigDecimal price;
    }
}