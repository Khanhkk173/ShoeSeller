package com.example.shoestore.service;

import com.example.shoestore.dto.request.ImportRequest;
import com.example.shoestore.entity.*;
import com.example.shoestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final ImportRepository importRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository variantRepository;

    public List<Import> findAll() {
        return importRepository.findAll();
    }

    public Import findById(Integer id) {
        return importRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập id=" + id));
    }

    @Transactional
    public Import create(ImportRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));

        Import importRecord = Import.builder()
                .supplier(supplier)
                .build();

        Import saved = importRepository.save(importRecord);

        List<ImportDetail> details = request.getItems().stream().map(item -> {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy biến thể id=" + item.getVariantId()));

            // Cộng vào tồn kho
            variant.setStock(variant.getStock() + item.getQuantity());
            variantRepository.save(variant);

            return ImportDetail.builder()
                    .importRecord(saved)
                    .variant(variant)
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .build();
        }).collect(Collectors.toList());

        saved.setImportDetails(details);
        return importRepository.save(saved);
    }
}