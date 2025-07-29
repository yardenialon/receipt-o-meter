-- יצירת bucket לתמונות מוצרים אם לא קיים
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- יצירת policies להעלאת תמונות
CREATE POLICY "Allow public uploads to product_images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product_images');

CREATE POLICY "Allow public access to product_images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product_images');

CREATE POLICY "Allow public updates to product_images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'product_images');

CREATE POLICY "Allow public deletes to product_images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product_images');