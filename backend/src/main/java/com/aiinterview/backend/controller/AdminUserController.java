package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.AdminUserPageResponse;
import com.aiinterview.backend.dto.AdminUserResponse;
import com.aiinterview.backend.dto.BanUserRequest;
import com.aiinterview.backend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * GET /admin/users?page=0&size=10&email=&status=
     * status: "active" | "banned" | "" (all)
     */
    @GetMapping
    public ResponseEntity<AdminUserPageResponse> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(adminUserService.getUsers(page, size, email, status));
    }

    /**
     * PUT /admin/users/{id}/ban
     */
    @PutMapping("/{id}/ban")
    public ResponseEntity<AdminUserResponse> banUser(
            @PathVariable UUID id,
            @RequestBody(required = false) BanUserRequest request
    ) {
        String reason = (request != null) ? request.getReason() : null;
        return ResponseEntity.ok(adminUserService.banUser(id, reason));
    }

    /**
     * PUT /admin/users/{id}/unban
     */
    @PutMapping("/{id}/unban")
    public ResponseEntity<AdminUserResponse> unbanUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.unbanUser(id));
    }
}
