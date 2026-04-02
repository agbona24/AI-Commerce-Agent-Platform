<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        $smartphones = Category::where('slug', 'smartphones')->first();
        $laptops = Category::where('slug', 'laptops')->first();
        $audio = Category::where('slug', 'audio')->first();

        $products = [
            [
                'name' => 'iPhone 15 Pro',
                'slug' => 'iphone-15-pro',
                'description' => 'The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
                'short_description' => 'Premium smartphone with A17 Pro chip',
                'sku' => 'IP15PRO-256',
                'category_id' => $smartphones?->id,
                'price' => 999.00,
                'compare_at_price' => 1099.00,
                'quantity' => 50,
                'status' => 'active',
                'is_featured' => true,
                'images' => ['https://example.com/iphone15pro.jpg'],
                'specifications' => [
                    'Storage' => '256GB',
                    'Display' => '6.1-inch Super Retina XDR',
                    'Chip' => 'A17 Pro',
                ],
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra',
                'slug' => 'samsung-galaxy-s24-ultra',
                'description' => 'Ultimate Galaxy experience with S Pen and AI features.',
                'short_description' => 'Premium Android flagship',
                'sku' => 'SGS24U-512',
                'category_id' => $smartphones?->id,
                'price' => 1199.00,
                'quantity' => 35,
                'status' => 'active',
                'is_featured' => true,
                'images' => ['https://example.com/s24ultra.jpg'],
            ],
            [
                'name' => 'MacBook Pro 14"',
                'slug' => 'macbook-pro-14',
                'description' => 'Powerful laptop with M3 Pro chip for professional workflows.',
                'short_description' => 'Professional laptop with M3 Pro',
                'sku' => 'MBP14-M3PRO',
                'category_id' => $laptops?->id,
                'price' => 1999.00,
                'quantity' => 25,
                'status' => 'active',
                'is_featured' => true,
                'images' => ['https://example.com/mbp14.jpg'],
            ],
            [
                'name' => 'Dell XPS 15',
                'slug' => 'dell-xps-15',
                'description' => 'Premium Windows laptop with stunning display.',
                'short_description' => 'Premium Windows laptop',
                'sku' => 'DXPS15-I7',
                'category_id' => $laptops?->id,
                'price' => 1499.00,
                'quantity' => 20,
                'status' => 'active',
                'images' => ['https://example.com/xps15.jpg'],
            ],
            [
                'name' => 'AirPods Pro 2',
                'slug' => 'airpods-pro-2',
                'description' => 'Active noise cancellation earbuds with adaptive audio.',
                'short_description' => 'Premium wireless earbuds',
                'sku' => 'APP2-USB-C',
                'category_id' => $audio?->id,
                'price' => 249.00,
                'quantity' => 100,
                'status' => 'active',
                'is_featured' => true,
                'images' => ['https://example.com/airpodspro2.jpg'],
            ],
            [
                'name' => 'Sony WH-1000XM5',
                'slug' => 'sony-wh-1000xm5',
                'description' => 'Industry-leading noise canceling headphones.',
                'short_description' => 'Premium noise-canceling headphones',
                'sku' => 'SNY-XM5-BLK',
                'category_id' => $audio?->id,
                'price' => 399.00,
                'quantity' => 45,
                'status' => 'active',
                'images' => ['https://example.com/xm5.jpg'],
            ],
            [
                'name' => 'Google Pixel 8 Pro',
                'slug' => 'google-pixel-8-pro',
                'description' => 'Best of Google with advanced AI features.',
                'short_description' => 'AI-powered smartphone',
                'sku' => 'GP8PRO-256',
                'category_id' => $smartphones?->id,
                'price' => 899.00,
                'quantity' => 30,
                'status' => 'active',
                'images' => ['https://example.com/pixel8pro.jpg'],
            ],
            [
                'name' => 'iPad Pro 12.9"',
                'slug' => 'ipad-pro-12-9',
                'description' => 'The ultimate iPad experience with M2 chip.',
                'short_description' => 'Professional tablet with M2',
                'sku' => 'IPPRO-129-M2',
                'category_id' => $smartphones?->id,
                'price' => 1099.00,
                'quantity' => 15,
                'status' => 'active',
                'images' => ['https://example.com/ipadpro.jpg'],
            ],
        ];

        foreach ($products as $product) {
            Product::create(array_merge($product, [
                'tenant_id' => $tenant->id,
                'low_stock_threshold' => 10,
                'currency' => 'USD',
            ]));
        }
    }
}
