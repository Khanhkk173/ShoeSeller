package com.example.shoestore.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class NewProductImportRequest {

    private String name;
    private String brand;

    private List<String> imageUrls; // ✅ THÊM

    private VariantRequest variant;

    @Data
    public static class VariantRequest {
        private Integer size;
        private String color;
        private BigDecimal price;
        private Integer stock;
    }
}