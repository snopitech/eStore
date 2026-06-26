package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URL;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class ImageSearchService {

    private final ProductRepository productRepository;

    ImageSearchService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> searchByImage(MultipartFile uploadedImage) throws IOException {
        // 1. Read the uploaded image
        BufferedImage queryImage = ImageIO.read(uploadedImage.getInputStream());
        if (queryImage == null) {
            throw new IOException("Invalid image file");
        }

        // 2. Generate color histogram for uploaded image
        double[] queryHistogram = extractColorHistogram(queryImage);

        // 3. Get all active products
        List<Product> allProducts = productRepository.findAll();
        
        // 4. Calculate similarity for each product
        Map<Long, Double> similarityScores = new HashMap<>();
        
        for (Product product : allProducts) {
            try {
                BufferedImage productImage = getProductImage(product);
                if (productImage != null) {
                    double[] productHistogram = extractColorHistogram(productImage);
                    double similarity = calculateCosineSimilarity(queryHistogram, productHistogram);
                    similarityScores.put(product.getId(), similarity);
                }
            } catch (Exception e) {
                // Skip products with no image or errors
                System.err.println("Error processing product " + product.getId() + ": " + e.getMessage());
            }
        }

        // 5. Sort by similarity (highest first) and return top 10
        return similarityScores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Product product = productRepository.findById(entry.getKey()).orElse(null);
                    return product != null ? convertToProductResponse(product, entry.getValue()) : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("deprecation")
    private BufferedImage getProductImage(Product product) {
        try {
            String imagesJson = product.getImages();
            if (imagesJson == null || imagesJson.isEmpty() || imagesJson.equals("[]")) {
                return null;
            }
            
            // Parse first image URL from JSON array
            // Example: ["https://r2-url.com/image1.jpg", "https://r2-url.com/image2.jpg"]
            String imageUrl = imagesJson.replaceAll("\\[", "")
                                       .replaceAll("\\]", "")
                                       .replaceAll("\"", "")
                                       .split(",")[0]
                                       .trim();
            
            if (imageUrl.isEmpty()) {
                return null;
            }
            
            // Download image from URL
            URL url = new URL(imageUrl);
            return ImageIO.read(url);
            
        } catch (Exception e) {
            System.err.println("Failed to load image for product " + product.getId() + ": " + e.getMessage());
            return null;
        }
    }

    private double[] extractColorHistogram(BufferedImage image) {
        // Resize image to 64x64 for faster processing
        BufferedImage resized = resizeImage(image, 64, 64);
        
        // Histogram bins: 8 bins for each RGB channel = 8*8*8 = 512 bins
        int bins = 8;
        double[] histogram = new double[bins * bins * bins];
        
        for (int y = 0; y < resized.getHeight(); y++) {
            for (int x = 0; x < resized.getWidth(); x++) {
                int rgb = resized.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                
                int rBin = r * bins / 256;
                int gBin = g * bins / 256;
                int bBin = b * bins / 256;
                
                int index = (rBin * bins * bins) + (gBin * bins) + bBin;
                histogram[index]++;
            }
        }
        
        // Normalize histogram
        int totalPixels = resized.getWidth() * resized.getHeight();
        for (int i = 0; i < histogram.length; i++) {
            histogram[i] /= totalPixels;
        }
        
        return histogram;
    }

    private BufferedImage resizeImage(BufferedImage original, int targetWidth, int targetHeight) {
        Image resultingImage = original.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH);
        BufferedImage outputImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = outputImage.createGraphics();
        g2d.drawImage(resultingImage, 0, 0, null);
        g2d.dispose();
        return outputImage;
    }

    private double calculateCosineSimilarity(double[] hist1, double[] hist2) {
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        
        for (int i = 0; i < hist1.length; i++) {
            dotProduct += hist1[i] * hist2[i];
            norm1 += hist1[i] * hist1[i];
            norm2 += hist2[i] * hist2[i];
        }
        
        if (norm1 == 0 || norm2 == 0) {
            return 0.0;
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    private ProductResponse convertToProductResponse(Product product, Double similarity) {
        ProductResponse response = new ProductResponse();
        
        // Basic fields
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setShortDescription(product.getShortDescription());
        response.setPrice(product.getPrice());
        response.setCompareAtPrice(product.getCompareAtPrice());
        response.setQuantity(product.getQuantity());
        response.setSku(product.getSku());
        response.setImages(product.getImages());
        response.setSpecifications(product.getSpecifications());
        response.setStatus(product.getStatus() != null ? product.getStatus().name() : null);
        response.setViewsCount(product.getViewsCount());
        response.setSalesCount(product.getSalesCount());
        response.setRating(product.getRating());
        response.setCreatedAt(product.getCreatedAt());
        
        // Category
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        
        // Seller
        if (product.getSeller() != null) {
            response.setSellerId(product.getSeller().getId());
            response.setStoreName(product.getSeller().getStoreName());
        }
        
        // Live streaming fields
        response.setIsLive(product.getIsLive());
        response.setLivePrice(product.getLivePrice());
        response.setLiveStartTime(product.getLiveStartTime());
        response.setLiveEndTime(product.getLiveEndTime());
        response.setViewerCount(product.getViewerCount());
        
        // Search fields
        response.setProductCondition(product.getProductCondition());
        response.setBrand(product.getBrand());
        response.setModel(product.getModel());
        response.setColor(product.getColor());
        response.setWeight(product.getWeight());
        response.setDimensions(product.getDimensions());
        response.setIsAuction(product.getIsAuction());
        response.setAuctionEndTime(product.getAuctionEndTime());
        response.setStartingBid(product.getStartingBid());
        response.setCurrentBid(product.getCurrentBid());
        
        // Add similarity score as a note (you can add this field to ProductResponse if needed)
        // For now, we'll just return the product
        
        return response;
    }
}
