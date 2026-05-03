package com.example.shoestore.service;

import com.example.shoestore.dto.request.CreateOrderRequest;
import com.example.shoestore.entity.Order;
import com.example.shoestore.entity.OrderDetail;
import com.example.shoestore.entity.ProductVariant;
import com.example.shoestore.repository.OrderDetailRepository;
import com.example.shoestore.repository.OrderRepository;
import com.example.shoestore.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {


        Order order = Order.builder()
                .orderDate(LocalDateTime.now())
                .status(Order.Status.PENDING) // ✅ FIX Ở ĐÂY
                .totalAmount(BigDecimal.ZERO)
                .build();


        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderRequest.Item item : request.getItems()) {

            ProductVariant variant = productVariantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

            if (variant.getStock() < item.getQuantity()) {
                throw new RuntimeException("Không đủ tồn kho");
            }

            // Trừ kho
            variant.setStock(variant.getStock() - item.getQuantity());
            productVariantRepository.save(variant);

            BigDecimal price = variant.getPrice();
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .variant(variant)
                    .quantity(item.getQuantity())
                    .price(price)
                    .build();

            orderDetailRepository.save(detail);
        }

        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<OrderDetail> getOrderDetails(Integer orderId) {
        return orderDetailRepository.findByOrderOrderId(orderId);
    }

    @Transactional
    public void cancelOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getStatus() != Order.Status.PENDING) {
            throw new RuntimeException("Chỉ huỷ được đơn PENDING");
        }

        List<OrderDetail> details = orderDetailRepository.findByOrderOrderId(orderId);

        for (OrderDetail d : details) {
            ProductVariant v = d.getVariant();
            v.setStock(v.getStock() + d.getQuantity());
            productVariantRepository.save(v);
        }

        order.setStatus(Order.Status.CANCELLED);
        orderRepository.save(order);
    }
    @Transactional
    public void completeOrder(Integer orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getStatus() != Order.Status.PENDING) {
            throw new RuntimeException("Chỉ có thể hoàn thành đơn PENDING");
        }

        order.setStatus(Order.Status.COMPLETED);
        orderRepository.save(order);
    }
}
