<?php

namespace App\Http\Controllers\Api\V1\Files;

use App\Http\Controllers\Api\V1\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileController extends BaseController
{
    /**
     * Upload a file
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:avatar,logo,document,image',
            'folder' => 'nullable|string|max:100',
        ]);

        $file = $request->file('file');
        $type = $request->input('type');
        $folder = $request->input('folder', $type . 's');
        
        // Validate file types based on upload type
        $allowedMimes = $this->getAllowedMimes($type);
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            return $this->error('Invalid file type for ' . $type, 422);
        }

        // Generate unique filename
        $tenantId = auth()->user()->tenant_id;
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        
        // Store file
        $path = $file->storeAs(
            "tenants/{$tenantId}/{$folder}",
            $filename,
            'public'
        );

        if (!$path) {
            return $this->error('Failed to upload file', 500);
        }

        $url = Storage::disk('public')->url($path);

        return $this->success([
            'path' => $path,
            'url' => $url,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ], 'File uploaded successfully');
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:2048', // 2MB max for avatars
        ]);

        $file = $request->file('file');
        $userId = auth()->id();
        
        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = "avatar_{$userId}." . $extension;
        
        // Store file
        $path = $file->storeAs(
            'avatars',
            $filename,
            'public'
        );

        if (!$path) {
            return $this->error('Failed to upload avatar', 500);
        }

        $url = Storage::disk('public')->url($path);
        
        // Update user's avatar
        auth()->user()->update(['avatar' => $url]);

        return $this->success([
            'url' => $url,
        ], 'Avatar uploaded successfully');
    }

    /**
     * Upload business logo
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:2048', // 2MB max
        ]);

        $file = $request->file('file');
        $tenantId = auth()->user()->tenant_id;
        
        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = "logo_{$tenantId}." . $extension;
        
        // Store file
        $path = $file->storeAs(
            'logos',
            $filename,
            'public'
        );

        if (!$path) {
            return $this->error('Failed to upload logo', 500);
        }

        $url = Storage::disk('public')->url($path);
        
        // Update tenant's logo
        auth()->user()->tenant->update(['logo' => $url]);

        return $this->success([
            'url' => $url,
        ], 'Logo uploaded successfully');
    }

    /**
     * Upload document for knowledge base
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:20480', // 20MB max for documents
        ]);

        $file = $request->file('file');
        $tenantId = auth()->user()->tenant_id;
        
        // Validate document types
        $allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            return $this->error('Invalid document type. Allowed: PDF, DOC, DOCX, TXT, CSV, XLS, XLSX', 422);
        }
        
        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        
        // Store file
        $path = $file->storeAs(
            "tenants/{$tenantId}/documents",
            $filename,
            'local'
        );

        if (!$path) {
            return $this->error('Failed to upload document', 500);
        }

        return $this->success([
            'path' => $path,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ], 'Document uploaded successfully');
    }

    /**
     * Delete a file
     */
    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');
        $tenantId = auth()->user()->tenant_id;
        
        // Security: ensure file belongs to tenant
        if (!str_contains($path, "tenants/{$tenantId}/")) {
            return $this->error('Unauthorized', 403);
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return $this->success(null, 'File deleted');
        } elseif (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
            return $this->success(null, 'File deleted');
        }

        return $this->error('File not found', 404);
    }

    /**
     * Get allowed MIME types for upload type
     */
    private function getAllowedMimes(string $type): array
    {
        return match ($type) {
            'avatar', 'logo' => [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
            ],
            'image' => [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
            ],
            'document' => [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
            default => [],
        };
    }
}
