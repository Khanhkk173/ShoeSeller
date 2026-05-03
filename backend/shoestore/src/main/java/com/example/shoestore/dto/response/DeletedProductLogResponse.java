package com.example.shoestore.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DeletedProductLogResponse {
    private Integer id;
    private String productName;
    private String brand;
    private Integer size;
    private String color;
    private BigDecimal price;
    private LocalDateTime deletedAt;
}