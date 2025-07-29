-- Create product_images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for product_images bucket
CREATE POLICY "Public Access for product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product_images');

CREATE POLICY "Service role can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product_images' AND ((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Service role can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product_images' AND ((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Service role can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product_images' AND ((auth.jwt() ->> 'role'::text) = 'service_role'::text));