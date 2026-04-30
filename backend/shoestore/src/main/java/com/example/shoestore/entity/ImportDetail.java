package com.example.shoestore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "import_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Import importRecord;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;
}