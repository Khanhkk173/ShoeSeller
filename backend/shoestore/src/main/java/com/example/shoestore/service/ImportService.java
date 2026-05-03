package com.example.shoestore.service;

import com.example.shoestore.dto.request.ImportRequest;
import com.example.shoestore.dto.request.NewProductImportRequest;
import com.example.shoestore.dto.response.ImportHistoryResponse;
import com.example.shoestore.entity.ImportHistory;
import com.example.shoestore.entity.Product;
import com.example.shoestore.entity.ProductImage;
import com.example.shoestore.entity.ProductVariant;
import com.example.shoestore.repository.ImportHistoryRepository;
import com.example.shoestore.repository.ProductImageRepository;
import com.example.shoestore.repository.ProductRepository;
import com.example.shoestore.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ImportHistoryRepository importHistoryRepository;
    private final ProductImageRepository productImageRepository;


    @Transactional
    public ProductVariant importStock(ImportRequest request) {

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy variant"));

        // ✅ Tăng tồn kho
        variant.setStock(variant.getStock() + request.getQuantity());
        productVariantRepository.save(variant);

        // ✅ Lưu lịch sử nhập hàng
        ImportHistory history = ImportHistory.builder()
                .variant(variant)
                .quantity(request.getQuantity())
                .importedAt(LocalDateTime.now())
                .build();

        importHistoryRepository.save(history);

        return variant;
    }
    @Transactional
    public Product importNewProduct(NewProductImportRequest request) {

        Product temp = Product.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .build();

        Product product = productRepository.save(temp); // ✅ product chỉ gán 1 lần

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .size(request.getVariant().getSize())
                .color(request.getVariant().getColor())
                .price(request.getVariant().getPrice())
                .stock(request.getVariant().getStock())
                .build();

        productVariantRepository.save(variant);

        // ✅ FIX LỖI LAMBDA
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {

            final Product savedProduct = product; // ✅ biến final

            List<ProductImage> images = request.getImageUrls().stream()
                    .map(url -> ProductImage.builder()
                            .product(savedProduct)
                            .imageUrl(url)
                            .build())
                    .toList();

            productImageRepository.saveAll(images);
        }

        return product;
    }


    public List<ImportHistoryResponse> getImportHistory() {

        return importHistoryRepository.findAllByOrderByImportedAtDesc()
                .stream()
                .map(h -> {
                    ImportHistoryResponse dto = new ImportHistoryResponse();
                    dto.setImportId(h.getImportId());
                    dto.setQuantity(h.getQuantity());
                    dto.setImportedAt(h.getImportedAt());

                    ProductVariant v = h.getVariant();
                    dto.setSize(v.getSize());
                    dto.setColor(v.getColor());
                    dto.setProductName(v.getProduct().getName());

                    return dto;
                }).toList();
    }

}