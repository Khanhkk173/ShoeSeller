package com.example.shoestore.controller;

import com.example.shoestore.dto.request.LoginRequest;
import com.example.shoestore.dto.request.RegisterRequest;
import com.example.shoestore.dto.response.ApiResponse;
import com.example.shoestore.entity.User;
import com.example.shoestore.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(
            @RequestBody @Valid LoginRequest request,
            HttpSession session) {

        User user = authService.login(request);

        session.setAttribute("userId", user.getUserId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole().name());

        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", java.util.Map.of(
                "userId", user.getUserId(),
                "username", user.getUsername(),
                "role", user.getRole().name()
        )));
    }
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(
            @RequestBody @Valid RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.status(201)
                .body(ApiResponse.ok("Đăng ký thành công", user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(ApiResponse.ok("Đã đăng xuất", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(ApiResponse.ok(username));
    }
}
