package com.example.shoestore.controller;

import com.example.shoestore.dto.request.CreateOrderRequest;
import com.example.shoestore.entity.Order;
import com.example.shoestore.entity.OrderDetail;
import com.example.shoestore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /* =====================
       ✅ TẠO ĐƠN HÀNG
    ====================== */
    @PostMapping
    public Order createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    /* =====================
       ✅ LỊCH SỬ ĐƠN HÀNG
    ====================== */
    @GetMapping
    public List<Order> getOrders() {
        return orderService.getAllOrders();
    }

    /* =====================
       ✅ CHI TIẾT ĐƠN HÀNG
    ====================== */
    @GetMapping("/{orderId}/details")
    public List<OrderDetail> getOrderDetails(@PathVariable Integer orderId) {
        return orderService.getOrderDetails(orderId);
    }

    /* =====================
       ✅ HỦY ĐƠN + HOÀN KHO
    ====================== */
    @PutMapping("/{orderId}/cancel")
    public String cancelOrder(@PathVariable Integer orderId) {
        orderService.cancelOrder(orderId);
        return "Huỷ đơn hàng thành công";
    }

    @PutMapping("/{orderId}/complete")
    public String completeOrder(@PathVariable Integer orderId) {
        orderService.completeOrder(orderId);
        return "Hoàn thành đơn hàng thành công";
    }
}
