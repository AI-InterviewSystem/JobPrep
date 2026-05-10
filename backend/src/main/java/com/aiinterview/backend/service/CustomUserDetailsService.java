package com.aiinterview.backend.service;

import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (Boolean.TRUE.equals(user.getIsBanned())) {
            String reason = user.getBanReason() != null ? user.getBanReason() : "Violated terms of service";
            throw new org.springframework.security.authentication.LockedException("Your account has been suspended: " + reason);
        }

        return new UserPrincipal(user);
    }
}
