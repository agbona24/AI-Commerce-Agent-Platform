<?php

namespace App\Enums;

enum ChannelType: string
{
    case WHATSAPP = 'whatsapp';
    case VOICE = 'voice';
    case WEB_WIDGET = 'web_widget';
    case EMAIL = 'email';
    case SMS = 'sms';
    case INSTAGRAM = 'instagram';
    case FACEBOOK = 'facebook';
    case TELEGRAM = 'telegram';

    public function label(): string
    {
        return match($this) {
            self::WHATSAPP => 'WhatsApp',
            self::VOICE => 'Voice Call',
            self::WEB_WIDGET => 'Web Widget',
            self::EMAIL => 'Email',
            self::SMS => 'SMS',
            self::INSTAGRAM => 'Instagram',
            self::FACEBOOK => 'Facebook Messenger',
            self::TELEGRAM => 'Telegram',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::WHATSAPP => 'whatsapp',
            self::VOICE => 'phone',
            self::WEB_WIDGET => 'message-circle',
            self::EMAIL => 'mail',
            self::SMS => 'message-square',
            self::INSTAGRAM => 'instagram',
            self::FACEBOOK => 'facebook',
            self::TELEGRAM => 'send',
        };
    }
}
