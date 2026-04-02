<?php

namespace App\Enums;

enum AgentType: string
{
    case SALES = 'sales';
    case SUPPORT = 'support';
    case BOOKING = 'booking';
    case LEAD_QUALIFICATION = 'lead_qualification';
    case CUSTOM = 'custom';

    public function label(): string
    {
        return match($this) {
            self::SALES => 'Sales Agent',
            self::SUPPORT => 'Support Agent',
            self::BOOKING => 'Booking Agent',
            self::LEAD_QUALIFICATION => 'Lead Qualification',
            self::CUSTOM => 'Custom Agent',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::SALES => 'Handle product inquiries and close sales',
            self::SUPPORT => 'Provide customer support and resolve issues',
            self::BOOKING => 'Schedule appointments and manage bookings',
            self::LEAD_QUALIFICATION => 'Qualify leads and collect information',
            self::CUSTOM => 'Custom workflow agent',
        };
    }
}
