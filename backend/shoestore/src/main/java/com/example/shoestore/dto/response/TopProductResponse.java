package com.example.shoestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class TopProductResponse {
    private String productName;
    private Long quantitySold;
    private BigDecimal revenue;
}