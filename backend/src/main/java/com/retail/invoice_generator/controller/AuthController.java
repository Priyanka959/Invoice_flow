package com.retail.invoice_generator.controller;

import com.retail.invoice_generator.dto.request.LoginRequest;
import com.retail.invoice_generator.dto.response.LoginResponse;
import com.retail.invoice_generator.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // Logout is handled client-side by clearing the JWT token from storage (e.g., LocalStorage or Cookies).
        // On the server-side, since we use stateless JWT authentication, we simply return a 200 OK.
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}

