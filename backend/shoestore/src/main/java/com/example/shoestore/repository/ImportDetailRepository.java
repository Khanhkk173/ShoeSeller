package com.example.shoestore.repository;

import com.example.shoestore.entity.ImportDetail;
import com.example.shoestore.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportDetailRepository extends JpaRepository<ImportDetail, Integer> {

    void deleteByVariant(ProductVariant variant);
}