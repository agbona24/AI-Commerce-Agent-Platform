<?php

namespace App\Enums;

enum CallStatus: string
{
    case COMPLETED = 'completed';
    case MISSED = 'missed';
    case FAILED = 'failed';
    case BUSY = 'busy';
    case NO_ANSWER = 'no_answer';
    case IN_PROGRESS = 'in_progress';
    case VOICEMAIL = 'voicemail';

    public function label(): string
    {
        return match($this) {
            self::COMPLETED => 'Completed',
            self::MISSED => 'Missed',
            self::FAILED => 'Failed',
            self::BUSY => 'Busy',
            self::NO_ANSWER => 'No Answer',
            self::IN_PROGRESS => 'In Progress',
            self::VOICEMAIL => 'Voicemail',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::COMPLETED => 'green',
            self::MISSED => 'red',
            self::FAILED => 'red',
            self::BUSY => 'yellow',
            self::NO_ANSWER => 'orange',
            self::IN_PROGRESS => 'blue',
            self::VOICEMAIL => 'purple',
        };
    }
}
