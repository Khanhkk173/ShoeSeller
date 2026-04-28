package com.qlbangiay.shoestore.controller;

import com.qlbangiay.shoestore.entity.User;
import com.qlbangiay.shoestore.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        service.register(user);
        return "Register success";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        User u = service.login(user.getUsername(), user.getPassword());

        if (u != null) {
            return "Login success";
        }
        return "Login failed";
    }
}
