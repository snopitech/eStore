package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.service.ImageSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:3000")
public class ImageSearchController {

    private final ImageSearchService imageSearchService;

    ImageSearchController(ImageSearchService imageSearchService) {
        this.imageSearchService = imageSearchService;
    }

    @PostMapping("/by-image")
    public ResponseEntity<List<ProductResponse>> searchByImage(
            @RequestParam("image") MultipartFile imageFile) {
        
        try {
            List<ProductResponse> results = imageSearchService.searchByImage(imageFile);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}