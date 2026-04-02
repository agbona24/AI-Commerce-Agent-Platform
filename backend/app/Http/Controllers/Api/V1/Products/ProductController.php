<?php

namespace App\Http\Controllers\Api\V1\Products;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Product\CreateProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends BaseController
{
    /**
     * List all products
     */
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->when($request->category_id, fn($q, $id) => $q->where('category_id', $id))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->search, fn($q, $search) => $q->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            }))
            ->when($request->min_price, fn($q, $price) => $q->where('price', '>=', $price))
            ->when($request->max_price, fn($q, $price) => $q->where('price', '<=', $price))
            ->when($request->in_stock, fn($q) => $q->where('quantity', '>', 0))
            ->when($request->featured, fn($q) => $q->where('is_featured', true))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_order ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return $this->paginated($products);
    }

    /**
     * Get a single product
     */
    public function show(Product $product): JsonResponse
    {
        return $this->success(new ProductResource($product->load('category')));
    }

    /**
     * Create a new product
     */
    public function store(CreateProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['slug'] = Str::slug($data['name']);

        $product = Product::create($data);

        return $this->created(
            new ProductResource($product),
            'Product created successfully'
        );
    }

    /**
     * Update a product
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product->update($data);

        return $this->success(
            new ProductResource($product),
            'Product updated successfully'
        );
    }

    /**
     * Delete a product
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return $this->success(null, 'Product deleted successfully');
    }

    /**
     * Bulk update products
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id',
            'data' => 'required|array',
        ]);

        Product::whereIn('id', $request->ids)->update($request->data);

        return $this->success(null, 'Products updated successfully');
    }

    /**
     * Bulk delete products
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id',
        ]);

        Product::whereIn('id', $request->ids)->delete();

        return $this->success(null, 'Products deleted successfully');
    }

    /**
     * Import products from CSV
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        // TODO: Implement CSV import
        return $this->success(['imported' => 0], 'Import started');
    }

    /**
     * Export products to CSV
     */
    public function export(Request $request): JsonResponse
    {
        // TODO: Implement CSV export
        return $this->success(['download_url' => '/exports/products.csv']);
    }
}
