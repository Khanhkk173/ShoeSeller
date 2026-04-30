package com.example.shoestore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "imports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Import {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "import_id")
    private Integer importId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Supplier supplier;

    @Column(name = "import_date")
    private LocalDateTime importDate;

    @OneToMany(mappedBy = "importRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ImportDetail> importDetails;

    @PrePersist
    public void prePersist() {
        if (importDate == null) importDate = LocalDateTime.now();
    }
}