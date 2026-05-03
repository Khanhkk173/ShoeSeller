package com.example.shoestore.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ImportHistoryResponse {

    private Integer importId;
    private String productName;
    private Integer size;
    private String color;
    private Integer quantity;
    private LocalDateTime importedAt;
}