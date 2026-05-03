package com.example.shoestore.service;

import com.example.shoestore.dto.request.ProductRequest;
import com.example.shoestore.dto.response.ProductImportResponse;
import com.example.shoestore.entity.*;
import com.example.shoestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ImportHistoryRepository importHistoryRepository;
    private final ImportDetailRepository importDetailRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final DeletedProductLogRepository deletedProductLogRepository;

    public List<Product> search(String keyword, String brand, Integer categoryId) {
        return productRepository.searchProducts(keyword, brand, categoryId);
    }

    public Product findById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id=" + id));
    }

    @Transactional
    public Product create(ProductRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .category(category)
                .description(request.getDescription())
                .build();

        Product saved = productRepository.save(product);

        if (request.getVariants() != null) {
            List<ProductVariant> variants = request.getVariants().stream()
                    .map(v -> ProductVariant.builder()
                            .product(saved)
                            .size(v.getSize())
                            .color(v.getColor())
                            .price(v.getPrice())
                            .stock(v.getStock() != null ? v.getStock() : 0)
                            .build())
                    .collect(Collectors.toList());
            variantRepository.saveAll(variants);
        }

        if (request.getImageUrls() != null) {
            List<ProductImage> images = request.getImageUrls().stream()
                    .map(url -> ProductImage.builder()
                            .product(saved)
                            .imageUrl(url)
                            .build())
                    .collect(Collectors.toList());
            saved.setImages(images);
        }

        return productRepository.findById(saved.getProductId()).orElse(saved);
    }

    @Transactional
    public Product update(Integer id, ProductRequest request) {
        Product product = findById(id);
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            product.setCategory(category);
        }
        return productRepository.save(product);
    }

    @Transactional
    public void delete(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id=" + id));

        List<ProductVariant> variants = variantRepository.findByProductProductId(id);

        // ✅ Ghi log xóa cho từng variant trước khi xóa
        for (ProductVariant variant : variants) {
            DeletedProductLog log = DeletedProductLog.builder()
                    .productName(product.getName())
                    .brand(product.getBrand())
                    .size(variant.getSize())
                    .color(variant.getColor())
                    .price(variant.getPrice())
                    .deletedAt(LocalDateTime.now())
                    .build();
            deletedProductLogRepository.save(log);

            // Xóa các bảng con tham chiếu variant
            orderDetailRepository.deleteByVariant(variant);
            importDetailRepository.deleteByVariant(variant);
            importHistoryRepository.deleteByVariant(variant);
        }

        variantRepository.deleteAll(variants);
        productRepository.delete(product);
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public List<ProductImportResponse> getProductsForImport() {
        List<Product> products = productRepository.findAll();

        return products.stream().map(p -> {
            ProductImportResponse dto = new ProductImportResponse();
            dto.setProductId(p.getProductId());
            dto.setName(p.getName());

            List<ProductImportResponse.VariantResponse> variants =
                    variantRepository.findByProductProductId(p.getProductId())
                            .stream()
                            .map(v -> {
                                ProductImportResponse.VariantResponse vr =
                                        new ProductImportResponse.VariantResponse();
                                vr.setVariantId(v.getVariantId());
                                vr.setSize(v.getSize());
                                vr.setColor(v.getColor());
                                vr.setStock(v.getStock());
                                vr.setPrice(v.getPrice());
                                return vr;
                            })
                            .collect(Collectors.toList());

            dto.setVariants(variants);
            return dto;
        }).collect(Collectors.toList());
    }
}