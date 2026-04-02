import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  remember: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration validation schema
export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{6,14}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol'),
  password_confirmation: z
    .string()
    .min(1, 'Please confirm your password'),
  company_name: z
    .string()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  account_type: z.enum(['business', 'agency'], {
    message: 'Please select an account type',
  }),
  terms: z.literal(true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Onboarding validation schemas
export const onboardingBusinessInfoSchema = z.object({
  business_name: z
    .string()
    .min(1, 'Business name is required')
    .min(2, 'Business name must be at least 2 characters'),
  website: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\//.test(val) || /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/.test(val), {
      message: 'Please enter a valid website URL',
    }),
  team_size: z.string().optional(),
});

export const onboardingIndustrySchema = z.object({
  industry: z.string().min(1, 'Please select an industry'),
  custom_industry: z.string().optional(),
});

export const onboardingAIConfigSchema = z.object({
  ai_tasks: z
    .array(z.string())
    .min(1, 'Please select at least one AI task'),
  ai_tone: z.string().min(1, 'Please select a tone'),
});

export const onboardingChannelsSchema = z.object({
  channels: z
    .array(z.string())
    .min(1, 'Please select at least one channel'),
});

export type OnboardingBusinessInfoData = z.infer<typeof onboardingBusinessInfoSchema>;
export type OnboardingIndustryData = z.infer<typeof onboardingIndustrySchema>;
export type OnboardingAIConfigData = z.infer<typeof onboardingAIConfigSchema>;
export type OnboardingChannelsData = z.infer<typeof onboardingChannelsSchema>;
