
package com.example.shoestore.repository;

import com.example.shoestore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByBrand(String brand);

    @Query("SELECT p FROM Product p WHERE " +
            "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:brand IS NULL OR p.brand = :brand) AND " +
            "(:categoryId IS NULL OR p.category.categoryId = :categoryId)")
    List<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("brand") String brand,
            @Param("categoryId") Integer categoryId
    );

    @Query("""
    SELECT DISTINCT p FROM Product p
    LEFT JOIN FETCH p.images
    LEFT JOIN FETCH p.variants
    WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
""")
    List<Product> searchByName(@Param("name") String name);

    /**
     * Tìm theo tên + lọc theo category (tuỳ chọn mở rộng sau).
     */
    @Query("""
    SELECT DISTINCT p FROM Product p
    LEFT JOIN FETCH p.images
    LEFT JOIN FETCH p.variants
    WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
      AND p.category.id = :categoryId
""")
    List<Product> searchByNameAndCategory(@Param("name") String name,
                                          @Param("categoryId") Integer categoryId);

}