-- הוספת עמודת product_name לטבלת product_images
ALTER TABLE public.product_images 
ADD COLUMN product_name TEXT;