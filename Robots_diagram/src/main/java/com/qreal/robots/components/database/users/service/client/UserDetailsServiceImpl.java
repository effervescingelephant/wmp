package com.qreal.robots.components.database.users.service.client;

import com.qreal.robots.components.authorization.model.auth.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

//It is needed for Spring Security

@Service("userDetailsService")
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    UserService userService;

    @Transactional(readOnly = true)
    @Override
    public UserDetails loadUserByUsername(final String username)
            throws UsernameNotFoundException {

        com.qreal.robots.components.authorization.model.auth.User user =
                userService.findByUserName(username);

        List<GrantedAuthority> authorities =
                buildUserAuthority(user.getRoles());

        return buildUserForAuthentication(user, authorities);

    }

    private User buildUserForAuthentication(com.qreal.robots.components.authorization.model.auth.User user,
                                            List<GrantedAuthority> authorities) {
        return new User(user.getUsername(), user.getPassword(),
                user.isEnabled(), true, true, true, authorities);
    }

    private List<GrantedAuthority> buildUserAuthority(Set<UserRole> userRoles) {

        Set<GrantedAuthority> setAuths = userRoles.stream().map(userRole -> new SimpleGrantedAuthority(userRole
                .getRole())).collect(Collectors.toSet());
        List<GrantedAuthority> Result = new ArrayList<GrantedAuthority>(setAuths);
        return Result;
    }

}