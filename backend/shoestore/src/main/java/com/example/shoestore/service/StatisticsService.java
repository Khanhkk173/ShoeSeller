package com.example.shoestore.service;

import com.example.shoestore.entity.Order;
import com.example.shoestore.repository.OrderRepository;
import com.example.shoestore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // Doanh thu theo khoảng thời gian
    public Map<String, Object> getRevenue(LocalDateTime from, LocalDateTime to) {
        BigDecimal revenue = orderRepository.sumRevenueByDateRange(from, to);
        List<Order> orders = orderRepository.findByDateRange(from, to);

        long completedCount = orders.stream()
                .filter(o -> o.getStatus() == Order.Status.completed).count();
        long pendingCount = orders.stream()
                .filter(o -> o.getStatus() == Order.Status.pending).count();
        long cancelledCount = orders.stream()
                .filter(o -> o.getStatus() == Order.Status.cancelled).count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue", revenue != null ? revenue : BigDecimal.ZERO);
        result.put("totalOrders", orders.size());
        result.put("completed", completedCount);
        result.put("pending", pendingCount);
        result.put("cancelled", cancelledCount);
        result.put("from", from);
        result.put("to", to);
        return result;
    }

    // Top 5 sản phẩm bán chạy
    public List<Map<String, Object>> getTopProducts() {
        List<Order> completedOrders = orderRepository.findByStatus(Order.Status.completed);

        // Đếm số lượng bán theo tên sản phẩm
        Map<String, Long> salesMap = new LinkedHashMap<>();
        completedOrders.forEach(order -> {
            if (order.getOrderDetails() != null) {
                order.getOrderDetails().forEach(detail -> {
                    String productName = detail.getVariant().getProduct().getName();
                    salesMap.merge(productName, (long) detail.getQuantity(), Long::sum);
                });
            }
        });

        // Sắp xếp và lấy top 5
        return salesMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("productName", e.getKey());
                    item.put("totalSold", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
    }

    // Thống kê tổng quan dashboard
    public Map<String, Object> getDashboardSummary() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime now = LocalDateTime.now();

        BigDecimal monthRevenue = orderRepository.sumRevenueByDateRange(startOfMonth, now);
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.findByStatus(Order.Status.pending).size();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("monthRevenue", monthRevenue != null ? monthRevenue : BigDecimal.ZERO);
        summary.put("totalProducts", totalProducts);
        summary.put("totalOrders", totalOrders);
        summary.put("pendingOrders", pendingOrders);
        return summary;
    }
}