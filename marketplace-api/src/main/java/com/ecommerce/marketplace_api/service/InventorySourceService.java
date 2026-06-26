package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.InventorySourceRequest;
import com.ecommerce.marketplace_api.dto.InventorySourceResponse;
import com.ecommerce.marketplace_api.model.InventorySource;
import com.ecommerce.marketplace_api.repository.InventorySourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventorySourceService {

    private final InventorySourceRepository inventorySourceRepository;

    public InventorySourceService(InventorySourceRepository inventorySourceRepository) {
        this.inventorySourceRepository = inventorySourceRepository;
    }

    // ===== CREATE =====
    @Transactional
    public InventorySourceResponse createInventorySource(InventorySourceRequest request) {
        if (inventorySourceRepository.existsByName(request.getName())) {
            throw new RuntimeException("Inventory source with name '" + request.getName() + "' already exists");
        }

        InventorySource source = new InventorySource();
        source.setName(request.getName());
        source.setDescription(request.getDescription());
        source.setWebsite(request.getWebsite());
        source.setContactEmail(request.getContactEmail());
        source.setContactPhone(request.getContactPhone());
        source.setApiEndpoint(request.getApiEndpoint());
        source.setApiKey(request.getApiKey());
        source.setCommissionRate(request.getCommissionRate() != null ? request.getCommissionRate() : 5.0);
        source.setIsActive(true);

        InventorySource saved = inventorySourceRepository.save(source);
        return convertToResponse(saved);
    }

    // ===== GET ALL =====
    public List<InventorySourceResponse> getAllInventorySources() {
        return inventorySourceRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ===== GET ACTIVE =====
    public List<InventorySourceResponse> getActiveInventorySources() {
        return inventorySourceRepository.findByIsActiveTrue().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ===== GET BY ID =====
    public InventorySourceResponse getInventorySourceById(Long id) {
        InventorySource source = inventorySourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory source not found"));
        return convertToResponse(source);
    }

    // ===== UPDATE =====
    @Transactional
    public InventorySourceResponse updateInventorySource(Long id, InventorySourceRequest request) {
        InventorySource source = inventorySourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory source not found"));

        // Check name uniqueness
        if (!source.getName().equals(request.getName()) && inventorySourceRepository.existsByName(request.getName())) {
            throw new RuntimeException("Inventory source with name '" + request.getName() + "' already exists");
        }

        source.setName(request.getName());
        source.setDescription(request.getDescription());
        source.setWebsite(request.getWebsite());
        source.setContactEmail(request.getContactEmail());
        source.setContactPhone(request.getContactPhone());
        source.setApiEndpoint(request.getApiEndpoint());
        source.setApiKey(request.getApiKey());
        source.setCommissionRate(request.getCommissionRate() != null ? request.getCommissionRate() : 5.0);
        source.setUpdatedAt(LocalDateTime.now());

        InventorySource updated = inventorySourceRepository.save(source);
        return convertToResponse(updated);
    }

    // ===== DELETE (Soft Delete) =====
    @Transactional
    public void deleteInventorySource(Long id) {
        InventorySource source = inventorySourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory source not found"));
        source.setIsActive(false);
        source.setUpdatedAt(LocalDateTime.now());
        inventorySourceRepository.save(source);
    }

    // ===== ACTIVATE =====
    @Transactional
    public void activateInventorySource(Long id) {
        InventorySource source = inventorySourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory source not found"));
        source.setIsActive(true);
        source.setUpdatedAt(LocalDateTime.now());
        inventorySourceRepository.save(source);
    }

    // ===== DEACTIVATE =====
    @Transactional
    public void deactivateInventorySource(Long id) {
        InventorySource source = inventorySourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory source not found"));
        source.setIsActive(false);
        source.setUpdatedAt(LocalDateTime.now());
        inventorySourceRepository.save(source);
    }

    // ===== CONVERT TO RESPONSE =====
    private InventorySourceResponse convertToResponse(InventorySource source) {
        return new InventorySourceResponse(
                source.getId(),
                source.getName(),
                source.getDescription(),
                source.getWebsite(),
                source.getContactEmail(),
                source.getContactPhone(),
                source.getApiEndpoint(),
                source.getCommissionRate(),
                source.getIsActive(),
                source.getCreatedAt(),
                source.getUpdatedAt()
        );
    }
}
