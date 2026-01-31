export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type QuestionType = 
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'number'
  | 'phone'
  | 'url'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'rating'
  | 'scale'
  | 'date'
  | 'yes_no'
  | 'file_upload'
  | 'signature'
  | 'matrix'
  | 'ranking'
  | 'slider'
  | 'nps'
  | 'payment'
  | 'address'
  | 'calculator'
  | 'welcome'
  | 'thank_you'

export type LogicOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'

export interface LogicCondition {
  id: string
  questionId: string // The question to check
  operator: LogicOperator
  value?: string | number | boolean // The value to compare against
}

export interface LogicRule {
  id: string
  conditions: LogicCondition[]
  conditionLogic: 'and' | 'or' // How to combine conditions
  action: 'show' | 'skip' // What to do when conditions match
  jumpToQuestionId?: string // Optional: jump to specific question
}

export interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  properties: {
    placeholder?: string
    options?: { id: string; label: string; value: string }[]
    min?: number
    max?: number
    step?: number
    maxLength?: number
    allowMultiple?: boolean
    buttonText?: string
    // Screen image properties (for welcome/thank_you)
    coverImage?: string // Landscape cover image at top
    screenImage?: string // Centered image/icon
    // Alignment for individual question
    alignment?: 'left' | 'center' | 'right'
    // File upload properties
    acceptedFileTypes?: string[] // e.g., ['image/*', 'application/pdf']
    maxFileSize?: number // in MB
    maxFiles?: number
    // Matrix/Grid properties
    rows?: { id: string; label: string }[]
    columns?: { id: string; label: string }[]
    // Slider properties
    minLabel?: string
    maxLabel?: string
    showValue?: boolean
    // NPS properties
    leftLabel?: string // "Not likely"
    rightLabel?: string // "Very likely"
    // Payment properties
    amount?: number
    currency?: string
    productName?: string
    productDescription?: string
    productImage?: string
    stripePublishableKey?: string
    stripePriceId?: string
    // Payment provider properties
    paymentProvider?: 'stripe' | 'dodo' | 'polar'
    stripeProductId?: string
    stripePaymentLink?: string
    dodoProductId?: string
    dodoPaymentLink?: string
    polarProductId?: string
    polarPaymentLink?: string
    paymentButtonText?: string
    // Address properties
    addressFields?: ('street' | 'city' | 'state' | 'zip' | 'country')[]
    enableAutocomplete?: boolean
    // Calculator properties
    formula?: string // e.g., "{{q1}} * {{q2}} + 10"
    decimalPlaces?: number
    prefix?: string // e.g., "$"
    suffix?: string // e.g., "%"
  }
  logic?: LogicRule // Conditional logic for this question
}

export interface Webhook {
  id: string
  url: string
  enabled: boolean
  events: ('response.created' | 'response.updated')[]
  headers?: Record<string, string>
  secret?: string // For signature verification
}

export interface Integration {
  id: string
  type: 'email' | 'webhook' | 'sheets' | 'notion' | 'stripe'
  name: string
  enabled: boolean
  config: Record<string, unknown>
}

export interface EmailNotificationSettings {
  enabled: boolean
  to?: string
  replyTo?: string
  subject?: string
  body?: string
}

export interface ResponderEmailSettings {
  enabled: boolean
  emailField?: string
  subject?: string
  body?: string
}

export interface SEOSettings {
  title?: string
  description?: string
  image?: string
  favicon?: string
}

export interface FormSettings {
  showProgressBar: boolean
  showQuestionNumbers: boolean
  shuffleQuestions: boolean
  enableAnimations?: boolean
  theme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    buttonColor?: string
    buttonTextColor?: string
    fontFamily: string
    buttonStyle?: 'rounded' | 'square' | 'pill'
    backgroundType?: 'solid' | 'gradient' | 'image'
    backgroundImage?: string
    backgroundLayout?: 'stack' | 'split' | 'wallpaper'
    backgroundGradient?: string
    gradientStart?: string
    gradientEnd?: string
    questionAlignment?: 'left' | 'center' | 'right'
  }
  webhooks?: Webhook[]
  integrations?: Integration[]
  
  // General/Display Settings
  showNavigationArrows?: boolean
  enableRefillLink?: boolean
  enableRecaptcha?: boolean
  showPoweredBy?: boolean
  
  // Email Settings
  emailNotifications?: EmailNotificationSettings
  responderEmail?: ResponderEmailSettings
  
  // Access & Scheduling
  closeForm?: boolean
  closeByDate?: {
    enabled: boolean
    date?: string
  }
  closeBySubmissions?: {
    enabled: boolean
    max?: number
  }
  autoRefresh?: boolean
  
  // Hidden Fields & Variables
  hiddenFields?: string[]
  variables?: { name: string; type: string }[]
  
  // Link/SEO Settings
  seo?: SEOSettings
  
  // Custom Domain
  customDomain?: string
  customDomainVerified?: boolean
  
  // Language
  language?: string
  
  // Partial Submissions
  enablePartialSubmissions?: boolean
  partialSubmissionMessage?: string
  
  // Pre-fill
  enablePrefill?: boolean
  prefillMapping?: Record<string, string> // URL param -> question ID
  
  // Custom closed messages
  closedMessage?: string
  closedByDateMessage?: string
  closedByLimitMessage?: string
}

export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          questions: Question[]
          settings: FormSettings
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          questions?: Question[]
          settings?: FormSettings
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          questions?: Question[]
          settings?: FormSettings
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      responses: {
        Row: {
          id: string
          form_id: string
          answers: Record<string, Json>
          submitted_at: string
          metadata: {
            userAgent?: string
            ip?: string
            // Analytics tracking
            startedAt?: string
            completedAt?: string
            questionTimes?: Record<string, number> // questionId -> seconds spent
            dropOffQuestionId?: string // Last question viewed if not completed
            isComplete?: boolean
            // Geographic data
            country?: string
            city?: string
            region?: string
            latitude?: number
            longitude?: number
            // Device info
            device?: 'desktop' | 'mobile' | 'tablet'
            browser?: string
            os?: string
          } | null
        }
        Insert: {
          id?: string
          form_id: string
          answers: Record<string, Json>
          submitted_at?: string
          metadata?: {
            userAgent?: string
            ip?: string
            startedAt?: string
            completedAt?: string
            questionTimes?: Record<string, number>
            dropOffQuestionId?: string
            isComplete?: boolean
            country?: string
            city?: string
            region?: string
            latitude?: number
            longitude?: number
            device?: 'desktop' | 'mobile' | 'tablet'
            browser?: string
            os?: string
          } | null
        }
        Update: {
          id?: string
          form_id?: string
          answers?: Record<string, Json>
          submitted_at?: string
          metadata?: {
            userAgent?: string
            ip?: string
            startedAt?: string
            completedAt?: string
            questionTimes?: Record<string, number>
            dropOffQuestionId?: string
            isComplete?: boolean
            country?: string
            city?: string
            region?: string
            latitude?: number
            longitude?: number
            device?: 'desktop' | 'mobile' | 'tablet'
            browser?: string
            os?: string
          } | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      domains: {
        Row: {
          id: string
          user_id: string
          workspace_id: string | null
          domain: string
          verified: boolean
          verification_token: string | null
          favicon: string | null
          meta_title: string | null
          meta_description: string | null
          meta_image: string | null
          search_indexing: boolean
          code_injection: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id?: string | null
          domain: string
          verified?: boolean
          verification_token?: string | null
          favicon?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_image?: string | null
          search_indexing?: boolean
          code_injection?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string | null
          domain?: string
          verified?: boolean
          verification_token?: string | null
          favicon?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_image?: string | null
          search_indexing?: boolean
          code_injection?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      domain_urls: {
        Row: {
          id: string
          domain_id: string
          form_id: string
          slug: string
          is_default: boolean
          meta_title: string | null
          meta_description: string | null
          meta_image: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          domain_id: string
          form_id: string
          slug: string
          is_default?: boolean
          meta_title?: string | null
          meta_description?: string | null
          meta_image?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          domain_id?: string
          form_id?: string
          slug?: string
          is_default?: boolean
          meta_title?: string | null
          meta_description?: string | null
          meta_image?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Form = Database['public']['Tables']['forms']['Row']
export type FormInsert = Database['public']['Tables']['forms']['Insert']
export type FormUpdate = Database['public']['Tables']['forms']['Update']
export type Response = Database['public']['Tables']['responses']['Row']
export type ResponseInsert = Database['public']['Tables']['responses']['Insert']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Domain = Database['public']['Tables']['domains']['Row']
export type DomainInsert = Database['public']['Tables']['domains']['Insert']
export type DomainUrl = Database['public']['Tables']['domain_urls']['Row']
export type DomainUrlInsert = Database['public']['Tables']['domain_urls']['Insert']
