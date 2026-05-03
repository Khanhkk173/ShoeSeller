package com.example.shoestore.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO trả về cho API tìm kiếm sản phẩm.
 * Gồm: tên, brand, category, ảnh đầu tiên, giá thấp nhất, tổng tồn kho.
 */
public class ProductSearchDTO {

    private Integer productId;
    private String name;
    private String brand;
    private String category;
    private String image;          // ảnh đầu tiên
    private BigDecimal price;      // giá thấp nhất trong các variant
    private Integer stock;         // tổng tồn kho tất cả variant
    private List<VariantDTO> variants;

    // ---- Inner DTO cho variant ----
    public static class VariantDTO {
        private Integer variantId;
        private Integer size;
        private String color;
        private BigDecimal price;
        private Integer stock;

        public VariantDTO(Integer variantId, Integer size, String color,
                          BigDecimal price, Integer stock) {
            this.variantId = variantId;
            this.size      = size;
            this.color     = color;
            this.price     = price;
            this.stock     = stock;
        }

        public Integer getVariantId() { return variantId; }
        public Integer getSize()      { return size; }
        public String getColor()      { return color; }
        public BigDecimal getPrice()  { return price; }
        public Integer getStock()     { return stock; }
    }

    // ---- Constructor ----
    public ProductSearchDTO(Integer productId, String name, String brand,
                            String category, String image,
                            BigDecimal price, Integer stock,
                            List<VariantDTO> variants) {
        this.productId = productId;
        this.name      = name;
        this.brand     = brand;
        this.category  = category;
        this.image     = image;
        this.price     = price;
        this.stock     = stock;
        this.variants  = variants;
    }

    // ---- Getters ----
    public Integer getProductId()        { return productId; }
    public String getName()              { return name; }
    public String getBrand()             { return brand; }
    public String getCategory()          { return category; }
    public String getImage()             { return image; }
    public BigDecimal getPrice()         { return price; }
    public Integer getStock()            { return stock; }
    public List<VariantDTO> getVariants(){ return variants; }
}