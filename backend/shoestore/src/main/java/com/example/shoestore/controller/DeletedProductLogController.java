package com.example.shoestore.controller;

import com.example.shoestore.dto.response.ApiResponse;
import com.example.shoestore.dto.response.DeletedProductLogResponse;
import com.example.shoestore.repository.DeletedProductLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/deleted-products")
@RequiredArgsConstructor
public class DeletedProductLogController {

    private final DeletedProductLogRepository repo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeletedProductLogResponse>>> getAll() {
        List<DeletedProductLogResponse> list = repo.findAllByOrderByDeletedAtDesc()
                .stream()
                .map(log -> {
                    DeletedProductLogResponse dto = new DeletedProductLogResponse();
                    dto.setId(log.getId());
                    dto.setProductName(log.getProductName());
                    dto.setBrand(log.getBrand());
                    dto.setSize(log.getSize());
                    dto.setColor(log.getColor());
                    dto.setPrice(log.getPrice());
                    dto.setDeletedAt(log.getDeletedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}