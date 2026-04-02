<?php

namespace App\Enums;

enum UserRole: string
{
    case OWNER = 'owner';
    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case AGENT = 'agent';
    case VIEWER = 'viewer';

    public function label(): string
    {
        return match($this) {
            self::OWNER => 'Owner',
            self::ADMIN => 'Administrator',
            self::MANAGER => 'Manager',
            self::AGENT => 'Agent',
            self::VIEWER => 'Viewer',
        };
    }

    public function permissions(): array
    {
        return match($this) {
            self::OWNER => ['*'],
            self::ADMIN => ['create', 'read', 'update', 'delete', 'manage_users', 'manage_billing'],
            self::MANAGER => ['create', 'read', 'update', 'delete', 'manage_agents'],
            self::AGENT => ['read', 'update', 'handle_conversations'],
            self::VIEWER => ['read'],
        };
    }
}
