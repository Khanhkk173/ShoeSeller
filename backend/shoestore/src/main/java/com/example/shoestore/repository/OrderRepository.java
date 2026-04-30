package com.example.shoestore.repository;

import com.example.shoestore.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByStatus(Order.Status status);

    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :from AND :to")
    List<Order> findByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status")
    BigDecimal sumRevenueByStatus(@Param("status") Order.Status status);

    @Query("""
    SELECT DATE(o.orderDate), COALESCE(SUM(o.totalAmount), 0)
    FROM Order o
    WHERE o.status = :status
      AND o.orderDate BETWEEN :from AND :to
    GROUP BY DATE(o.orderDate)
    ORDER BY DATE(o.orderDate)
""")
    List<Object[]> sumRevenueGroupByDate(
            @Param("status") Order.Status status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}