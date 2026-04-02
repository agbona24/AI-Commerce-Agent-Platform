<?php

namespace App\Http\Controllers\Api\V1\Team;

use App\Enums\UserRole;
use App\Http\Controllers\Api\V1\BaseController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Enum;

class TeamController extends BaseController
{
    /**
     * Get all team members for the current tenant
     */
    public function index(Request $request): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        
        $query = User::where('tenant_id', $tenant->id);
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);
        
        $members = $query->paginate($request->get('per_page', 20));
        
        return $this->paginated($members);
    }

    /**
     * Get a single team member
     */
    public function show(User $member): JsonResponse
    {
        // Ensure the member belongs to the same tenant
        if ($member->tenant_id !== auth()->user()->tenant_id) {
            return $this->error('Team member not found', 404);
        }
        
        return $this->success($member);
    }

    /**
     * Invite a new team member
     */
    public function invite(Request $request): JsonResponse
    {
        // Only admins and owners can invite
        if (!auth()->user()->isAdmin()) {
            return $this->error('Unauthorized', 403);
        }
        
        $data = $request->validate([
            'email' => 'required|email|unique:users,email',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'role' => ['required', new Enum(UserRole::class)],
        ]);
        
        // Owners can only be set by other owners
        if ($data['role'] === UserRole::OWNER->value && !auth()->user()->isOwner()) {
            return $this->error('Only owners can assign the owner role', 403);
        }
        
        $tenant = auth()->user()->tenant;
        
        // Create user with temporary password
        $tempPassword = Str::random(12);
        
        $member = User::create([
            'tenant_id' => $tenant->id,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($tempPassword),
            'role' => $data['role'],
            'timezone' => 'UTC',
            'language' => 'en',
        ]);
        
        // In production, send invitation email with password reset link
        // Mail::to($member->email)->send(new TeamInvitation($member, $tempPassword));
        
        return $this->created($member, 'Team member invited successfully');
    }

    /**
     * Update a team member
     */
    public function update(Request $request, User $member): JsonResponse
    {
        // Ensure the member belongs to the same tenant
        if ($member->tenant_id !== auth()->user()->tenant_id) {
            return $this->error('Team member not found', 404);
        }
        
        // Only admins and owners can update other members
        if (!auth()->user()->isAdmin() && auth()->id() !== $member->id) {
            return $this->error('Unauthorized', 403);
        }
        
        $data = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'role' => ['sometimes', new Enum(UserRole::class)],
            'timezone' => 'nullable|string|max:100',
            'language' => 'nullable|string|max:10',
        ]);
        
        // Role changes require admin privileges
        if (isset($data['role'])) {
            if (!auth()->user()->isAdmin()) {
                return $this->error('Only admins can change roles', 403);
            }
            
            // Can't change role of the owner
            if ($member->isOwner() && !auth()->user()->isOwner()) {
                return $this->error('Cannot change the owner role', 403);
            }
            
            // Only owners can assign owner role
            if ($data['role'] === UserRole::OWNER->value && !auth()->user()->isOwner()) {
                return $this->error('Only owners can assign the owner role', 403);
            }
        }
        
        $member->update($data);
        
        return $this->success($member, 'Team member updated');
    }

    /**
     * Remove a team member
     */
    public function destroy(User $member): JsonResponse
    {
        // Ensure the member belongs to the same tenant
        if ($member->tenant_id !== auth()->user()->tenant_id) {
            return $this->error('Team member not found', 404);
        }
        
        // Only admins can remove members
        if (!auth()->user()->isAdmin()) {
            return $this->error('Unauthorized', 403);
        }
        
        // Can't remove yourself
        if (auth()->id() === $member->id) {
            return $this->error('Cannot remove yourself', 400);
        }
        
        // Can't remove the owner
        if ($member->isOwner()) {
            return $this->error('Cannot remove the account owner', 400);
        }
        
        // Revoke all tokens
        $member->tokens()->delete();
        
        // Delete the user
        $member->delete();
        
        return $this->success(null, 'Team member removed');
    }

    /**
     * Resend invitation email
     */
    public function resendInvite(User $member): JsonResponse
    {
        // Ensure the member belongs to the same tenant
        if ($member->tenant_id !== auth()->user()->tenant_id) {
            return $this->error('Team member not found', 404);
        }
        
        // Only admins can resend invites
        if (!auth()->user()->isAdmin()) {
            return $this->error('Unauthorized', 403);
        }
        
        // Generate new temporary password
        $tempPassword = Str::random(12);
        $member->update(['password' => Hash::make($tempPassword)]);
        
        // In production, send invitation email
        // Mail::to($member->email)->send(new TeamInvitation($member, $tempPassword));
        
        return $this->success(null, 'Invitation resent successfully');
    }

    /**
     * Get team statistics
     */
    public function stats(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        
        $stats = [
            'total' => User::where('tenant_id', $tenant->id)->count(),
            'by_role' => [
                'owner' => User::where('tenant_id', $tenant->id)->where('role', UserRole::OWNER)->count(),
                'admin' => User::where('tenant_id', $tenant->id)->where('role', UserRole::ADMIN)->count(),
                'agent' => User::where('tenant_id', $tenant->id)->where('role', UserRole::AGENT)->count(),
                'member' => User::where('tenant_id', $tenant->id)->where('role', UserRole::MEMBER)->count(),
            ],
            'recent' => User::where('tenant_id', $tenant->id)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(['id', 'first_name', 'last_name', 'email', 'role', 'created_at']),
        ];
        
        return $this->success($stats);
    }
}
