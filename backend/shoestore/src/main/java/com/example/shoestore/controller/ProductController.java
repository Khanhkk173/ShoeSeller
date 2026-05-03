package com.example.shoestore.controller;

import com.example.shoestore.dto.request.ProductRequest;
import com.example.shoestore.dto.response.ApiResponse;
import com.example.shoestore.dto.response.ProductImportResponse;
import com.example.shoestore.entity.Product;
import com.example.shoestore.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer categoryId) {
        List<Product> products = productService.search(keyword, brand, categoryId);
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getById(@PathVariable Integer id) {
        Product product = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> create(
            @RequestBody @Valid ProductRequest request) {
        Product product = productService.create(request);
        return ResponseEntity.status(201).body(ApiResponse.ok("Thêm sản phẩm thành công", product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> update(
            @PathVariable Integer id,
            @RequestBody @Valid ProductRequest request) {
        Product product = productService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa thành công", null));
    }
    @GetMapping("/import")
    public ResponseEntity<ApiResponse<List<ProductImportResponse>>> getProductsForImport() {
        return ResponseEntity.ok(
                ApiResponse.ok(productService.getProductsForImport())
        );
    }


}