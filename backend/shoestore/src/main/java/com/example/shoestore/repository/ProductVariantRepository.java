package com.example.shoestore.repository;

import com.example.shoestore.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {

    List<ProductVariant> findByProductProductId(Integer productId);

    @Query("SELECT COALESCE(SUM(pv.stock), 0) FROM ProductVariant pv")
    Long sumTotalStock();
}