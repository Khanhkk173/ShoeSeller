package com.example.shoestore.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    private Integer customerId;
    private List<Item> items;

    @Data
    public static class Item {
        private Integer variantId;
        private Integer quantity;
    }
}