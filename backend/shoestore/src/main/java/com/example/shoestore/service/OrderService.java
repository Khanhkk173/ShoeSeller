package com.example.shoestore.service;

import com.example.shoestore.dto.request.OrderRequest;
import com.example.shoestore.entity.*;
import com.example.shoestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductVariantRepository variantRepository;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findById(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng id=" + id));
    }

    public List<Order> findByStatus(String status) {
        return orderRepository.findByStatus(Order.Status.valueOf(status));
    }

    @Transactional
    public Order create(OrderRequest request) {
        // Tìm hoặc tạo khách hàng theo số điện thoại
        Customer customer = customerRepository
                .findByPhone(request.getCustomerPhone())
                .orElseGet(() -> customerRepository.save(
                        Customer.builder()
                                .name(request.getCustomerName())
                                .phone(request.getCustomerPhone())
                                .email(request.getCustomerEmail())
                                .address(request.getCustomerAddress())
                                .build()
                ));

        // Tạo đơn hàng
        Order order = Order.builder()
                .customer(customer)
                .status(Order.Status.pending)
                .totalAmount(BigDecimal.ZERO)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Tạo chi tiết đơn hàng và tính tổng tiền
        final BigDecimal[] total = {BigDecimal.ZERO};

        List<OrderDetail> details = request.getItems().stream().map(item -> {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy biến thể id=" + item.getVariantId()));

            // Kiểm tra tồn kho
            if (variant.getStock() < item.getQuantity()) {
                throw new RuntimeException(
                        "Sản phẩm " + variant.getProduct().getName() + " không đủ hàng");
            }

            // Trừ kho
            variant.setStock(variant.getStock() - item.getQuantity());
            variantRepository.save(variant);

            BigDecimal lineTotal = variant.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            total[0] = total[0].add(lineTotal);

            return OrderDetail.builder()
                    .order(savedOrder)
                    .variant(variant)
                    .quantity(item.getQuantity())
                    .price(variant.getPrice())
                    .build();
        }).collect(Collectors.toList());

        savedOrder.setOrderDetails(details);
        savedOrder.setTotalAmount(total[0]);

        return orderRepository.save(savedOrder);
    }

    @Transactional
    public Order updateStatus(Integer id, String status) {
        Order order = findById(id);
        order.setStatus(Order.Status.valueOf(status));
        return orderRepository.save(order);
    }
}