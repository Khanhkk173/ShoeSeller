package com.example.shoestore.controller;

import com.example.shoestore.dto.request.ImportRequest;
import com.example.shoestore.dto.response.ApiResponse;
import com.example.shoestore.entity.Import;
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

    @GetMapping
    public ResponseEntity<ApiResponse<List<Import>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(importService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Import>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(importService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Import>> create(
            @RequestBody @Valid ImportRequest request) {
        Import imp = importService.create(request);
        return ResponseEntity.status(201).body(ApiResponse.ok("Nhập hàng thành công", imp));
    }
}