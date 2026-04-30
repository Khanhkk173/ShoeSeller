package com.example.shoestore.repository;

import com.example.shoestore.entity.Import;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImportRepository extends JpaRepository<Import, Integer> {
    List<Import> findBySupplierSupplierId(Integer supplierId);
}