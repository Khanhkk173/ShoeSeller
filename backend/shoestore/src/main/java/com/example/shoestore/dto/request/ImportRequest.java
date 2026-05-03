package com.example.shoestore.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ImportRequest {

    @NotNull
    private Integer variantId;

    @Min(1)
    private Integer quantity;
}