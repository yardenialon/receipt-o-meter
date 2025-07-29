-- Update the first image of each product to be primary
UPDATE product_images 
SET is_primary = TRUE 
WHERE id IN (
    SELECT DISTINCT ON (product_code) id 
    FROM product_images 
    WHERE is_primary = FALSE
    ORDER BY product_code, created_at ASC
);