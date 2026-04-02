<?php

namespace App\Enums;

enum PhoneNumberStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case PENDING = 'pending';
    case SUSPENDED = 'suspended';
    case FAILED = 'failed';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
            self::PENDING => 'Pending Setup',
            self::SUSPENDED => 'Suspended',
            self::FAILED => 'Setup Failed',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::ACTIVE => 'green',
            self::INACTIVE => 'gray',
            self::PENDING => 'yellow',
            self::SUSPENDED => 'red',
            self::FAILED => 'red',
        };
    }
}
