package com.aiinterview.backend.service;

import com.aiinterview.backend.entity.Profile;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.ProfileRepository;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String email = oAuth2User.getAttribute("email");
        String googleId = oAuth2User.getAttribute("sub");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                userRepository.save(user);
            }
        } else {
            user = User.builder()
                    .email(email)
                    .googleId(googleId)
                    .emailVerified(true)
                    .isActive(true)
                    .build();

            Profile profile = Profile.builder()
                    .user(user)
                    .fullName(name)
                    .avatarUrl(picture)
                    .build();
            
            user.setProfile(profile);
            userRepository.save(user);
        }

        return oAuth2User; // We can wrap this in a custom OAuth2User if needed
    }
}
