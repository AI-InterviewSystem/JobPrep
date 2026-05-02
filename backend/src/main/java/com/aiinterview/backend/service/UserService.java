package com.aiinterview.backend.service;

import com.aiinterview.backend.entity.Profile;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /** Runs in its own transaction so it commits before the caller returns. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User upsertGoogleUser(String email, String googleId, String name, String picture) {
        return userRepository.findByEmail(email).map(existing -> {
            if (existing.getGoogleId() == null) existing.setGoogleId(googleId);
            if (existing.getProfile() != null
                    && (existing.getProfile().getAvatarUrl() == null
                        || existing.getProfile().getAvatarUrl().isEmpty())) {
                existing.getProfile().setAvatarUrl(picture);
            }
            return userRepository.save(existing);
        }).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email).googleId(googleId)
                    .emailVerified(true).isActive(true).build();
            newUser.setProfile(Profile.builder()
                    .user(newUser).fullName(name).avatarUrl(picture).build());
            return userRepository.save(newUser);
        });
    }
}
