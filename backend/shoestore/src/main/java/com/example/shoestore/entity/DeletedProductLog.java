package com.example.shoestore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "deleted_product_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeletedProductLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String productName;
    private String brand;
    private Integer size;
    private String color;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    private LocalDateTime deletedAt;
}