package com.example.shoestore.service;

import com.example.shoestore.dto.response.DailyRevenueResponse;
import com.example.shoestore.dto.response.OverviewStatisticsResponse;
import com.example.shoestore.dto.response.TopProductResponse;
import com.example.shoestore.entity.Order;
import com.example.shoestore.entity.OrderDetail;
import com.example.shoestore.repository.OrderDetailRepository;
import com.example.shoestore.repository.OrderRepository;
import com.example.shoestore.repository.ProductRepository;
import com.example.shoestore.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderDetailRepository orderDetailRepository;

    public OverviewStatisticsResponse getOverviewStatistics() {
        BigDecimal totalRevenue = orderRepository.sumRevenueByStatus(Order.Status.COMPLETED);
        Long totalOrders = orderRepository.count();
        Long totalProducts = productRepository.count();
        Long stockQuantity = productVariantRepository.sumTotalStock();

        return OverviewStatisticsResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders != null ? totalOrders : 0L)
                .totalProducts(totalProducts != null ? totalProducts : 0L)
                .stockQuantity(stockQuantity != null ? stockQuantity : 0L)
                .build();
    }

    public List<DailyRevenueResponse> getRevenueByLastDays(int days) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);

        List<Object[]> rawData = orderRepository.revenueGroupByDate(
                Order.Status.COMPLETED.name()
        );

        Map<LocalDate, BigDecimal> revenueMap = new HashMap<>();
        for (Object[] row : rawData) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            BigDecimal revenue = (BigDecimal) row[1];
            if (!date.isBefore(startDate) && !date.isAfter(today)) {
                revenueMap.put(date, revenue);
            }
        }

        List<DailyRevenueResponse> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            result.add(new DailyRevenueResponse(
                    date,
                    revenueMap.getOrDefault(date, BigDecimal.ZERO)
            ));
        }

        return result;
    }


    /* ========= TỔNG QUAN ========= */
    public OverviewStatisticsResponse getOverview() {

        BigDecimal revenue =
                orderRepository.sumRevenueByStatus(Order.Status.COMPLETED);

        Long orders =
                orderRepository.countByStatus(Order.Status.COMPLETED);

        Long sold =
                orderDetailRepository.findAll()
                        .stream()
                        .filter(d -> d.getOrder().getStatus() == Order.Status.COMPLETED)
                        .mapToLong(OrderDetail::getQuantity)
                        .sum();

        Long stock =
                productVariantRepository.sumTotalStock();

        return OverviewStatisticsResponse.builder()
                .totalRevenue(revenue)
                .totalOrders(orders)
                .totalSold(sold)
                .currentStock(stock)
                .build();
    }

    /* ========= DOANH THU THEO NGÀY ========= */
    public List<DailyRevenueResponse> revenueByDate() {
        return orderRepository.revenueGroupByDate(Order.Status.COMPLETED.name())
                .stream()
                .map(row -> {
                    LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                    BigDecimal revenue = (BigDecimal) row[1];

                    return new DailyRevenueResponse(date, revenue);
                })
                .toList();
    }
    /* ========= TOP SẢN PHẨM ========= */
    public List<TopProductResponse> topProducts() {
        return orderDetailRepository.topProducts()
                .stream()
                .map(r -> new TopProductResponse(
                        (String) r[0],
                        (Long) r[1],
                        (BigDecimal) r[2]
                ))
                .toList();
    }


}