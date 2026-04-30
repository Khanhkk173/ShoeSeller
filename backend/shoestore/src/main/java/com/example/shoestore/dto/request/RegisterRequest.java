package com.example.shoestore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 6, message = "Mật khẩu ít nhất 6 ký tự")
    private String password;

    private String role = "staff";
}