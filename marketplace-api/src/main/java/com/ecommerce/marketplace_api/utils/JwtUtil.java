package com.ecommerce.marketplace_api.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@SuppressWarnings("unused")
@Component
public class JwtUtil {
    
    private static final String SECRET = "mySuperSecretKeyForJWTThatIsAtLeast256BitsLong12345678901234567890";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());
    
    // 7 days in milliseconds
    private static final long EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 604,800,000 ms
    
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}