<?php

namespace App\Enums;

enum IntegrationStatus: string
{
    case CONNECTED = 'connected';
    case DISCONNECTED = 'disconnected';
    case PENDING = 'pending';
    case ERROR = 'error';

    public function label(): string
    {
        return match($this) {
            self::CONNECTED => 'Connected',
            self::DISCONNECTED => 'Disconnected',
            self::PENDING => 'Pending',
            self::ERROR => 'Error',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::CONNECTED => 'green',
            self::DISCONNECTED => 'gray',
            self::PENDING => 'yellow',
            self::ERROR => 'red',
        };
    }
}
