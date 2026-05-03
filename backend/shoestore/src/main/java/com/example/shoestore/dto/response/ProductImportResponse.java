package com.example.shoestore.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductImportResponse {

    private Integer productId;
    private String name;
    private List<VariantResponse> variants;

    @Data
    public static class VariantResponse {
        private Integer variantId;
        private Integer size;
        private String color;
        private Integer stock;
        private BigDecimal price;
    }
}