package com.example.shoestore.repository;

import com.example.shoestore.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
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

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'completed' " +
            "AND o.orderDate BETWEEN :from AND :to")
    java.math.BigDecimal sumRevenueByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}