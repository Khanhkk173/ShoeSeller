package com.example.shoestore.controller;

import com.example.shoestore.dto.request.ImportRequest;
import com.example.shoestore.dto.request.NewProductImportRequest;
import com.example.shoestore.dto.response.ApiResponse;
import com.example.shoestore.dto.response.ImportHistoryResponse;
import com.example.shoestore.entity.Product;
import com.example.shoestore.entity.ProductVariant;
import com.example.shoestore.service.ImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/imports")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductVariant>> importStock(
            @RequestBody @Valid ImportRequest request) {

        ProductVariant variant = importService.importStock(request);

        return ResponseEntity.ok(
                ApiResponse.ok("Nhập hàng thành công", variant)
        );
    }
    @PostMapping("/new-product")
    public ResponseEntity<ApiResponse<Product>> importNewProduct(
            @RequestBody NewProductImportRequest request) {

        Product product = importService.importNewProduct(request);

        return ResponseEntity.ok(
                ApiResponse.ok("Nhập sản phẩm mới thành công", product)
        );
    }
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ImportHistoryResponse>>> getImportHistory() {
        return ResponseEntity.ok(
                ApiResponse.ok(importService.getImportHistory())
        );
    }
}