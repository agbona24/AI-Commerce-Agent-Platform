<?php

namespace App\Http\Controllers\Api\V1\Products;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends BaseController
{
    /**
     * List all categories
     */
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->when($request->parent_id, fn($q, $id) => $q->where('parent_id', $id))
            ->when($request->root_only, fn($q) => $q->whereNull('parent_id'))
            ->when($request->active_only, fn($q) => $q->where('is_active', true))
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return $this->success(CategoryResource::collection($categories));
    }

    /**
     * Get category tree
     */
    public function tree(): JsonResponse
    {
        $categories = Category::whereNull('parent_id')
            ->with('children.children')
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return $this->success($categories);
    }

    /**
     * Get a single category
     */
    public function show(Category $category): JsonResponse
    {
        return $this->success(
            new CategoryResource($category->load(['parent', 'children', 'products']))
        );
    }

    /**
     * Create a new category
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|exists:categories,id',
            'image_url' => 'nullable|string|url',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['slug'] = Str::slug($data['name']);

        $category = Category::create($data);

        return $this->created(
            new CategoryResource($category),
            'Category created successfully'
        );
    }

    /**
     * Update a category
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|exists:categories,id',
            'image_url' => 'nullable|string|url',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $this->success(
            new CategoryResource($category),
            'Category updated successfully'
        );
    }

    /**
     * Delete a category
     */
    public function destroy(Category $category): JsonResponse
    {
        // Move products to parent category or uncategorized
        $category->products()->update(['category_id' => $category->parent_id]);
        
        // Move child categories to parent
        $category->children()->update(['parent_id' => $category->parent_id]);
        
        $category->delete();

        return $this->success(null, 'Category deleted successfully');
    }

    /**
     * Reorder categories
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->categories as $item) {
            Category::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return $this->success(null, 'Categories reordered');
    }
}
