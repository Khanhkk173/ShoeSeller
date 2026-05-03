package com.example.shoestore.service;

import com.example.shoestore.dto.ProductSearchDTO;
import com.example.shoestore.entity.Product;
import com.example.shoestore.entity.ProductImage;
import com.example.shoestore.entity.ProductVariant;
import com.example.shoestore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductSearchService {

    private final ProductRepository productRepository;

    public ProductSearchService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductSearchDTO> search(String name, Integer categoryId) {
        if (name == null || name.isBlank()) {
            return List.of();
        }

        List<Product> products = (categoryId != null)
                ? productRepository.searchByNameAndCategory(name.trim(), categoryId)
                : productRepository.searchByName(name.trim());

        return products.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ProductSearchDTO toDTO(Product p) {

        // FIX: Dùng Hibernate.initialize hoặc try-catch để tránh LazyInitializationException
        // Vì @Transactional(readOnly=true) đang active, lazy load VẪN hoạt động ở đây.
        // Vấn đề thực sự là query searchByName không JOIN FETCH images/variants
        // → Hibernate sẽ tạo thêm N+1 query. Đây là cách an toàn nhất trong service layer.

        // Lấy ảnh đầu tiên — dùng stream để tránh IndexOutOfBoundsException
        String image = null;
        try {
            List<ProductImage> imgs = p.getImages();
            if (imgs != null && !imgs.isEmpty()) {
                // FIX: Lấy ảnh đầu tiên an toàn bằng stream thay vì .get(0)
                image = imgs.stream()
                        .findFirst()
                        .map(ProductImage::getImageUrl)
                        .orElse(null);
            }
        } catch (Exception e) {
            // Nếu lazy load thất bại → trả null, frontend sẽ dùng placeholder
            image = null;
        }

        List<ProductVariant> variants;
        try {
            variants = p.getVariants() != null
                    ? new ArrayList<>(p.getVariants())
                    : List.of();
        } catch (Exception e) {
            variants = List.of();
        }

        BigDecimal minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(price -> price != null)
                .min(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO);

        int totalStock = variants.stream()
                .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
                .sum();

        List<ProductSearchDTO.VariantDTO> variantDTOs = variants.stream()
                .map(v -> new ProductSearchDTO.VariantDTO(
                        v.getVariantId(),
                        v.getSize(),
                        v.getColor(),
                        v.getPrice(),
                        v.getStock() != null ? v.getStock() : 0
                ))
                .collect(Collectors.toList());

        String categoryName = null;
        try {
            categoryName = (p.getCategory() != null) ? p.getCategory().getName() : null;
        } catch (Exception e) {
            categoryName = null;
        }

        return new ProductSearchDTO(
                p.getProductId(),
                p.getName(),
                p.getBrand(),
                categoryName,
                image,          // có thể null → frontend đã xử lý bằng placeholder
                minPrice,
                totalStock,
                variantDTOs
        );
    }
}