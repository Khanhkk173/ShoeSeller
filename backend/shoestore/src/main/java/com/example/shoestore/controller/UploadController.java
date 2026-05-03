package com.example.shoestore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final String UPLOAD_DIR = "uploads/products/";

    @PostMapping("/product-image")
    public ResponseEntity<String> uploadProductImage(
            @RequestParam("file") MultipartFile file) throws Exception {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File trống");
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File dest = new File(UPLOAD_DIR + fileName);

        dest.getParentFile().mkdirs();
        file.transferTo(dest);

        // URL public để frontend dùng
        return ResponseEntity.ok("/uploads/products/" + fileName);
    }
}