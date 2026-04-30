package com.example.shoestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class DailyRevenueResponse {
    private LocalDate date;
    private BigDecimal revenue;
}