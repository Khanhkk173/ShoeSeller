package com.example.shoestore.repository;

import com.example.shoestore.entity.ImportHistory;
import com.example.shoestore.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImportHistoryRepository extends JpaRepository<ImportHistory, Integer> {

    List<ImportHistory> findAllByOrderByImportedAtDesc();

    void deleteByVariant(ProductVariant variant); // ✅ Thêm dòng này
}