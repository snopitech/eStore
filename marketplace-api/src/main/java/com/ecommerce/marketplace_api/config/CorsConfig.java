package com.ecommerce.marketplace_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://192.168.1.221:5173",    // ← ADD THIS
                    "http://192.168.1.221:5174",    // ← ADD THIS
                    "https://estore-main.snopitech.workers.dev",
                    "https://estore.snopitech.com",
                    "https://admin.snopitech.com",
                    "https://pesky-dividers-blend.ngrok-free.dev"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}