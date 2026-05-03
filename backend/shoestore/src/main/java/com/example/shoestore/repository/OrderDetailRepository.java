package com.example.shoestore.repository;

import com.example.shoestore.entity.OrderDetail;
import com.example.shoestore.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {

    List<OrderDetail> findByOrderOrderId(Integer orderId);
    @Query("""
    SELECT d.variant.product.name,
           SUM(d.quantity),
           SUM(d.quantity * d.price)
    FROM OrderDetail d
    WHERE d.order.status = 'COMPLETED'
    GROUP BY d.variant.product.name
    ORDER BY SUM(d.quantity) DESC
""")
    List<Object[]> topProducts();
    void deleteByVariant(ProductVariant variant);
}
