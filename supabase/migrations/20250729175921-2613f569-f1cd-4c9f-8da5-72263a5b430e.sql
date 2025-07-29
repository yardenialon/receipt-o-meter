-- Add unique constraint for product_code and image_path combination
ALTER TABLE product_images 
ADD CONSTRAINT unique_product_code_image_path UNIQUE (product_code, image_path);