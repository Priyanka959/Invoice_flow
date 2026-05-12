package com.retail.invoice_generator.service;

import com.retail.invoice_generator.dto.request.CreateProductRequest;
import com.retail.invoice_generator.dto.request.UpdateProductRequest;
import com.retail.invoice_generator.dto.response.ProductResponse;
import com.retail.invoice_generator.exception.BusinessException;
import com.retail.invoice_generator.exception.ResourceNotFoundException;
import com.retail.invoice_generator.model.Product;
import com.retail.invoice_generator.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new BusinessException("Product with SKU " + request.getSku() + " already exists");
        }

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .unitPrice(request.getUnitPrice())
                .gstRate(request.getGstRate())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .isActive(request.getActive() != null ? request.getActive() : true)
                .build();

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getUnitPrice() != null) product.setUnitPrice(request.getUnitPrice());
        if (request.getGstRate() != null) product.setGstRate(request.getGstRate());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getActive() != null) product.setActive(request.getActive());

        return mapToResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        if (search != null && !search.isEmpty()) {
            return productRepository.searchProducts(search, pageable).map(this::mapToResponse);
        }
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getBySku(String sku) {
        return productRepository.findBySku(sku)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .unitPrice(product.getUnitPrice())
                .gstRate(product.getGstRate())
                .stockQuantity(product.getStockQuantity())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
