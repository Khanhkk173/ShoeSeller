package com.example.shoestore.controller;

import com.example.shoestore.dto.response.DailyRevenueResponse;
import com.example.shoestore.dto.response.OverviewStatisticsResponse;
import com.example.shoestore.dto.response.TopProductResponse;
import com.example.shoestore.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    // ✅ CHỈ 1 ENDPOINT OVERVIEW
    @GetMapping("/overview")
    public OverviewStatisticsResponse getOverview() {
        return statisticsService.getOverview();
    }

    // ✅ DOANH THU THEO NGÀY
    @GetMapping("/revenue")
    public List<DailyRevenueResponse> revenue() {
        return statisticsService.revenueByDate();
    }

    // ✅ TOP SẢN PHẨM
    @GetMapping("/top-products")
    public List<TopProductResponse> topProducts() {
        return statisticsService.topProducts();
    }
}