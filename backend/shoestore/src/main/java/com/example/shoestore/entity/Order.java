package com.example.shoestore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderId;

    private LocalDateTime orderDate;

    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private Status status;

    // ✅ ENUM CHUẨN – PHẢI CÓ ĐỦ 3 GIÁ TRỊ NÀY
    public enum Status {
        PENDING,
        COMPLETED,
        CANCELLED
    }
}