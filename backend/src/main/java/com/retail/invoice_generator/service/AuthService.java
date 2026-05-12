package com.retail.invoice_generator.service;

import com.retail.invoice_generator.dto.request.LoginRequest;
import com.retail.invoice_generator.dto.response.LoginResponse;
import com.retail.invoice_generator.model.User;
import com.retail.invoice_generator.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final com.retail.invoice_generator.repository.UserRepository userRepository;

    @Value("${app.jwt.expiry-ms}")
    private long jwtExpiration;

    public LoginResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String jwtToken = jwtService.generateToken(user);

        return LoginResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .expiresIn(jwtExpiration)
                .build();
    }
}

