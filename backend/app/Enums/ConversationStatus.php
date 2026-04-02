<?php

namespace App\Enums;

enum ConversationStatus: string
{
    case ACTIVE = 'active';
    case WAITING = 'waiting';
    case RESOLVED = 'resolved';
    case ESCALATED = 'escalated';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active',
            self::WAITING => 'Waiting',
            self::RESOLVED => 'Resolved',
            self::ESCALATED => 'Escalated',
            self::CLOSED => 'Closed',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::ACTIVE => 'green',
            self::WAITING => 'yellow',
            self::RESOLVED => 'blue',
            self::ESCALATED => 'red',
            self::CLOSED => 'gray',
        };
    }
}
