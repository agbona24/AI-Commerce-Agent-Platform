<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        $electronics = Category::create([
            'tenant_id' => $tenant->id,
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic devices and gadgets',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Category::create([
            'tenant_id' => $tenant->id,
            'parent_id' => $electronics->id,
            'name' => 'Smartphones',
            'slug' => 'smartphones',
            'description' => 'Mobile phones and accessories',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Category::create([
            'tenant_id' => $tenant->id,
            'parent_id' => $electronics->id,
            'name' => 'Laptops',
            'slug' => 'laptops',
            'description' => 'Laptops and notebooks',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Category::create([
            'tenant_id' => $tenant->id,
            'parent_id' => $electronics->id,
            'name' => 'Audio',
            'slug' => 'audio',
            'description' => 'Headphones, speakers, and audio equipment',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        $clothing = Category::create([
            'tenant_id' => $tenant->id,
            'name' => 'Clothing',
            'slug' => 'clothing',
            'description' => 'Fashion and apparel',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Category::create([
            'tenant_id' => $tenant->id,
            'parent_id' => $clothing->id,
            'name' => "Men's",
            'slug' => 'mens',
            'description' => "Men's clothing",
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Category::create([
            'tenant_id' => $tenant->id,
            'parent_id' => $clothing->id,
            'name' => "Women's",
            'slug' => 'womens',
            'description' => "Women's clothing",
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Category::create([
            'tenant_id' => $tenant->id,
            'name' => 'Home & Garden',
            'slug' => 'home-garden',
            'description' => 'Home decor and gardening',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        Category::create([
            'tenant_id' => $tenant->id,
            'name' => 'Sports',
            'slug' => 'sports',
            'description' => 'Sports equipment and fitness',
            'sort_order' => 4,
            'is_active' => true,
        ]);
    }
}
