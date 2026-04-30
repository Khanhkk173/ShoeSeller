package com.example.shoestore.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAddress;

    @NotNull(message = "Phải có ít nhất 1 sản phẩm")
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Integer variantId;
        private Integer quantity;
    }
}
