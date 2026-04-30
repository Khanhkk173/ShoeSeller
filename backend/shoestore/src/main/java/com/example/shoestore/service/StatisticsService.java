package com.example.shoestore.service;

import com.example.shoestore.dto.response.DailyRevenueResponse;
import com.example.shoestore.dto.response.OverviewStatisticsResponse;
import com.example.shoestore.entity.Order;
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

    public OverviewStatisticsResponse getOverviewStatistics() {
        BigDecimal totalRevenue = orderRepository.sumRevenueByStatus(Order.Status.completed);
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

        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to = today.atTime(LocalTime.MAX);

        List<Object[]> rawData = orderRepository.sumRevenueGroupByDate(
                Order.Status.completed,
                from,
                to
        );

        Map<LocalDate, BigDecimal> revenueMap = new HashMap<>();
        for (Object[] row : rawData) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            BigDecimal revenue = (BigDecimal) row[1];
            revenueMap.put(date, revenue);
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

}