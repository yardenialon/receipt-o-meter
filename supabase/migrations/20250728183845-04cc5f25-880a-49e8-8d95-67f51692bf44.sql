-- Fix critical database security issues

-- Enable RLS on missing tables
ALTER TABLE public.store_products_import ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keshet_products_import ENABLE ROW LEVEL SECURITY;

-- Add policies for service role only access to import tables
CREATE POLICY "Service role only access - store_products_import" 
ON public.store_products_import 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role only access - keshet_products_import" 
ON public.keshet_products_import 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Fix database function security by adding SECURITY DEFINER SET search_path = ''
CREATE OR REPLACE FUNCTION public.get_popular_products()
 RETURNS TABLE(name text, product_code text, count bigint)
 LANGUAGE sql
 SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT 
    name,
    product_code,
    COUNT(*) as count
  FROM 
    public.shopping_list_items
  WHERE 
    product_code IS NOT NULL
  GROUP BY 
    name, product_code
  ORDER BY 
    count DESC
  LIMIT 10;
$function$;

CREATE OR REPLACE FUNCTION public.process_imported_products()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
    -- יצירת טבלה זמנית עם הנתונים העדכניים ביותר
    CREATE TEMP TABLE latest_products AS
    SELECT DISTINCT ON (ItemCode, store_chain, store_id)
        store_chain,
        store_id,
        ItemCode,
        ItemName,
        ManufacturerName,
        ItemPrice,
        UnitQty,
        UnitOfMeasure,
        PriceUpdateDate,
        category,
        ItemType,
        ManufactureCountry,
        ManufacturerItemDescription,
        Quantity,
        bIsWeighted,
        QtyInPackage,
        UnitOfMeasurePrice,
        AllowDiscount,
        ItemStatus,
        -- שיפור הלוגיקה של מציאת branch_mapping_id
        (
            SELECT bm.id 
            FROM public.branch_mappings bm 
            WHERE TRIM(LOWER(bm.source_chain)) = TRIM(LOWER(store_chain))
            AND TRIM(bm.source_branch_id) = TRIM(store_id)
            LIMIT 1
        ) as branch_mapping_id
    FROM public.store_products_import
    ORDER BY ItemCode, store_chain, store_id, PriceUpdateDate DESC NULLS LAST;

    -- ביצוע ה-upsert מהטבלה הזמנית
    INSERT INTO public.store_products (
        store_chain,
        store_id,
        product_code,
        product_name,
        manufacturer,
        price,
        unit_quantity,
        unit_of_measure,
        price_update_date,
        category,
        item_type,
        manufacture_country,
        manufacturer_item_description,
        quantity,
        is_weighted,
        qty_in_package,
        unit_of_measure_price,
        allow_discount,
        item_status,
        branch_mapping_id
    )
    SELECT 
        store_chain,
        store_id,
        ItemCode as product_code,
        ItemName as product_name,
        ManufacturerName as manufacturer,
        ItemPrice as price,
        UnitQty as unit_quantity,
        UnitOfMeasure as unit_of_measure,
        CASE 
            WHEN PriceUpdateDate IS NULL OR PriceUpdateDate::text = '' 
            THEN NOW() 
            ELSE PriceUpdateDate 
        END as price_update_date,
        COALESCE(category, 'כללי') as category,
        ItemType as item_type,
        ManufactureCountry as manufacture_country,
        ManufacturerItemDescription as manufacturer_item_description,
        COALESCE(Quantity, 1) as quantity,
        COALESCE(bIsWeighted, false) as is_weighted,
        QtyInPackage as qty_in_package,
        UnitOfMeasurePrice as unit_of_measure_price,
        COALESCE(AllowDiscount, true) as allow_discount,
        COALESCE(ItemStatus, 'active') as item_status,
        branch_mapping_id
    FROM latest_products
    ON CONFLICT (product_code, store_chain, store_id) 
    DO UPDATE SET
        product_name = EXCLUDED.product_name,
        manufacturer = EXCLUDED.manufacturer,
        price = EXCLUDED.price,
        unit_quantity = EXCLUDED.unit_quantity,
        unit_of_measure = EXCLUDED.unit_of_measure,
        price_update_date = EXCLUDED.price_update_date,
        category = EXCLUDED.category,
        item_type = EXCLUDED.item_type,
        manufacture_country = EXCLUDED.manufacture_country,
        manufacturer_item_description = EXCLUDED.manufacturer_item_description,
        quantity = EXCLUDED.quantity,
        is_weighted = EXCLUDED.is_weighted,
        qty_in_package = EXCLUDED.qty_in_package,
        unit_of_measure_price = EXCLUDED.unit_of_measure_price,
        allow_discount = EXCLUDED.allow_discount,
        item_status = EXCLUDED.item_status,
        branch_mapping_id = EXCLUDED.branch_mapping_id;

    -- מחיקת הטבלה הזמנית
    DROP TABLE IF EXISTS latest_products;
    
    -- ניקוי טבלת הייבוא לאחר העיבוד
    TRUNCATE TABLE public.store_products_import;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_keshet_products()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
    -- Insert or update products in store_products table
    INSERT INTO public.store_products (
        store_chain,
        store_id,
        product_code,
        product_name,
        manufacturer,
        price,
        unit_quantity,
        unit_of_measure,
        price_update_date,
        category,
        item_type,
        manufacture_country,
        manufacturer_item_description,
        quantity,
        is_weighted,
        qty_in_package,
        unit_of_measure_price,
        allow_discount,
        item_status
    )
    SELECT 
        'קשת' as store_chain,
        StoreId,
        ItemCode,
        ItemName,
        ManufacturerName,
        ItemPrice,
        UnitQty,
        UnitOfMeasure,
        COALESCE(PriceUpdateDate, NOW()),
        'כללי' as category,
        ItemType,
        ManufactureCountry,
        ManufacturerItemDescription,
        COALESCE(Quantity, 1),
        COALESCE(bIsWeighted, false),
        QtyInPackage,
        UnitOfMeasurePrice,
        COALESCE(AllowDiscount, true),
        COALESCE(ItemStatus, 'active')
    FROM public.keshet_products_import
    ON CONFLICT (product_code, store_chain)
    DO UPDATE SET
        store_id = EXCLUDED.store_id,
        product_name = EXCLUDED.product_name,
        manufacturer = EXCLUDED.manufacturer,
        price = EXCLUDED.price,
        unit_quantity = EXCLUDED.unit_quantity,
        unit_of_measure = EXCLUDED.unit_of_measure,
        price_update_date = EXCLUDED.price_update_date,
        item_type = EXCLUDED.item_type,
        manufacture_country = EXCLUDED.manufacture_country,
        manufacturer_item_description = EXCLUDED.manufacturer_item_description,
        quantity = EXCLUDED.quantity,
        is_weighted = EXCLUDED.is_weighted,
        qty_in_package = EXCLUDED.qty_in_package,
        unit_of_measure_price = EXCLUDED.unit_of_measure_price,
        allow_discount = EXCLUDED.allow_discount,
        item_status = EXCLUDED.item_status;

    -- Clear import table
    TRUNCATE TABLE public.keshet_products_import;
END;
$function$;