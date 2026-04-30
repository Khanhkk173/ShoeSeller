package com.example.shoestore.controller;

import com.example.shoestore.dto.response.ApiResponse;
import com.example.shoestore.dto.response.DailyRevenueResponse;
import com.example.shoestore.dto.response.OverviewStatisticsResponse;
import com.example.shoestore.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<OverviewStatisticsResponse>> getOverview() {
        OverviewStatisticsResponse data = statisticsService.getOverviewStatistics();
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
    @GetMapping("/revenue-chart")
    public ResponseEntity<ApiResponse<List<DailyRevenueResponse>>> getRevenueChart(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(
                ApiResponse.ok(statisticsService.getRevenueByLastDays(days))
        );
    }
}
