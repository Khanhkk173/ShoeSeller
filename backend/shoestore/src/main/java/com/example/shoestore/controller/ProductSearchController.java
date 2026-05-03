package com.example.shoestore.controller;

import com.example.shoestore.dto.ProductSearchDTO;
import com.example.shoestore.service.ProductSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API tìm kiếm sản phẩm.
 *
 * GET /api/products/search?name=nike
 * GET /api/products/search?name=nike&categoryId=2
 *
 * FIX 1: Bỏ @CrossOrigin ở đây — cấu hình CORS tập trung ở SecurityConfig hoặc WebMvcConfigurer
 *         để tránh conflict với ProductController cùng mapping.
 * FIX 2: @RequestParam(required = false) để tránh 400 khi name rỗng,
 *         validation thủ công bên dưới.
 */
@RestController
@RequestMapping("/api/products")   // Giữ nguyên để URL /api/products/search vẫn hoạt động
public class ProductSearchController {

    private final ProductSearchService productSearchService;

    public ProductSearchController(ProductSearchService productSearchService) {
        this.productSearchService = productSearchService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String name,        // FIX 2: required = false
            @RequestParam(required = false) Integer categoryId) {

        // Validate thủ công — trả 400 với message rõ ràng thay vì Spring tự trả
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body("Tham số 'name' không được để trống.");
        }

        List<ProductSearchDTO> results = productSearchService.search(name.trim(), categoryId);
        return ResponseEntity.ok(results);
    }
}