package com.example.shoestore.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String brand;
    private Integer categoryId;
    private String description;
    private List<VariantRequest> variants;
    private List<String> imageUrls;

    @Data
    public static class VariantRequest {
        private Integer size;
        private String color;
        private java.math.BigDecimal price;
        private Integer stock;
    }
}
