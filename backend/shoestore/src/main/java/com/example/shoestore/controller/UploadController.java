package com.example.shoestore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    // FIX: Dùng absolute path thay vì relative path
    // System.getProperty("user.dir") trả về thư mục gốc của project đang chạy
    private static final String UPLOAD_DIR =
            System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "products" + File.separator;

    @PostMapping("/product-image")
    public ResponseEntity<String> uploadProductImage(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File trống");
        }

        try {
            // Tạo thư mục nếu chưa tồn tại
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Tạo tên file unique tránh trùng
            String originalName = file.getOriginalFilename();
            String ext = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String fileName = System.currentTimeMillis() + "_" + originalName;

            // FIX: Dùng absolute path để transferTo hoạt động đúng
            File dest = new File(UPLOAD_DIR + fileName);
            file.transferTo(dest.getAbsoluteFile());

            // Trả về URL public để frontend dùng
            return ResponseEntity.ok("/uploads/products/" + fileName);

        } catch (IOException e) {
            e.printStackTrace(); // In lỗi ra console IntelliJ để debug
            return ResponseEntity.status(500).body("Lỗi lưu file: " + e.getMessage());
        }
    }
}