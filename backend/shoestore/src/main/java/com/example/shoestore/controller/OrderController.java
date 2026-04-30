package com.example.shoestore.controller;

import com.example.shoestore.dto.request.OrderRequest;
import com.example.shoestore.dto.response.ApiResponse;
import com.example.shoestore.entity.Order;
import com.example.shoestore.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getAll(
            @RequestParam(required = false) String status) {
        List<Order> orders = (status != null)
                ? orderService.findByStatus(status)
                : orderService.findAll();
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> create(
            @RequestBody @Valid OrderRequest request) {
        Order order = orderService.create(request);
        return ResponseEntity.status(201).body(ApiResponse.ok("Tạo đơn hàng thành công", order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        Order order = orderService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công", order));
    }
}