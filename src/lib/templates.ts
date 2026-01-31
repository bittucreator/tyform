import type { Question } from '@/types/database'

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: 'feedback' | 'survey' | 'lead' | 'registration' | 'order' | 'quiz' | 'hr'
  icon: 'ChatCircle' | 'Envelope' | 'Ticket' | 'Briefcase' | 'ChartBar' | 'ShoppingCart' | 'Brain' | 'UserCircle'
  color: string
  questions: Question[]
}

export const formTemplates: FormTemplate[] = [
  {
    id: 'customer-feedback',
    name: 'Customer Feedback',
    description: 'Collect valuable feedback from your customers about their experience',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-blue-500',
    questions: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'We Value Your Feedback',
        description: 'Help us improve by sharing your experience. This will only take 2 minutes.',
        required: false,
        properties: { buttonText: 'Start' }
      },
      {
        id: 'q1',
        type: 'rating',
        title: 'How would you rate your overall experience?',
        description: 'Select a rating from 1 to 5 stars',
        required: true,
        properties: { max: 5 }
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        title: 'What did you like most about our service?',
        required: false,
        properties: {
          options: [
            { id: 'opt1', label: 'Product Quality', value: 'quality' },
            { id: 'opt2', label: 'Customer Service', value: 'service' },
            { id: 'opt3', label: 'Delivery Speed', value: 'delivery' },
            { id: 'opt4', label: 'Price', value: 'price' },
            { id: 'opt5', label: 'User Experience', value: 'ux' },
          ]
        }
      },
      {
        id: 'q3',
        type: 'long_text',
        title: 'Is there anything we could improve?',
        description: 'Your suggestions help us get better',
        required: false,
        properties: { placeholder: 'Share your thoughts...' }
      },
      {
        id: 'q4',
        type: 'nps',
        title: 'How likely are you to recommend us to a friend?',
        required: true,
        properties: { min: 0, max: 10 }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        title: 'Thank You!',
        description: 'We appreciate your feedback and will use it to improve our service.',
        required: false,
        properties: {}
      }
    ]
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'A simple contact form to capture leads and inquiries',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-emerald-500',
    questions: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Get in Touch',
        description: "We'd love to hear from you. Fill out the form below and we'll get back to you shortly.",
        required: false,
        properties: { buttonText: 'Continue' }
      },
      {
        id: 'q1',
        type: 'short_text',
        title: "What's your name?",
        required: true,
        properties: { placeholder: 'John Doe' }
      },
      {
        id: 'q2',
        type: 'email',
        title: "What's your email address?",
        required: true,
        properties: { placeholder: 'john@example.com' }
      },
      {
        id: 'q3',
        type: 'phone',
        title: "What's your phone number?",
        required: false,
        properties: { placeholder: '+1 (555) 123-4567' }
      },
      {
        id: 'q4',
        type: 'dropdown',
        title: 'What is this regarding?',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: 'General Inquiry', value: 'general' },
            { id: 'opt2', label: 'Sales', value: 'sales' },
            { id: 'opt3', label: 'Support', value: 'support' },
            { id: 'opt4', label: 'Partnership', value: 'partnership' },
            { id: 'opt5', label: 'Other', value: 'other' },
          ]
        }
      },
      {
        id: 'q5',
        type: 'long_text',
        title: 'Your message',
        required: true,
        properties: { placeholder: 'Tell us more about your inquiry...' }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        title: 'Message Sent!',
        description: "Thanks for reaching out. We'll get back to you within 24 hours.",
        required: false,
        properties: {}
      }
    ]
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Register attendees for your next event or webinar',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-purple-500',
    questions: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Event Registration',
        description: 'Register for our upcoming event. Spaces are limited!',
        required: false,
        properties: { buttonText: 'Register Now' }
      },
      {
        id: 'q1',
        type: 'short_text',
        title: 'Full Name',
        required: true,
        properties: { placeholder: 'Enter your full name' }
      },
      {
        id: 'q2',
        type: 'email',
        title: 'Email Address',
        description: "We'll send confirmation and updates to this email",
        required: true,
        properties: { placeholder: 'your@email.com' }
      },
      {
        id: 'q3',
        type: 'short_text',
        title: 'Company / Organization',
        required: false,
        properties: { placeholder: 'Your company name' }
      },
      {
        id: 'q4',
        type: 'short_text',
        title: 'Job Title',
        required: false,
        properties: { placeholder: 'Your role' }
      },
      {
        id: 'q5',
        type: 'multiple_choice',
        title: 'How did you hear about this event?',
        required: false,
        properties: {
          options: [
            { id: 'opt1', label: 'Email', value: 'email' },
            { id: 'opt2', label: 'Social Media', value: 'social' },
            { id: 'opt3', label: 'Colleague', value: 'colleague' },
            { id: 'opt4', label: 'Search Engine', value: 'search' },
            { id: 'opt5', label: 'Other', value: 'other' },
          ]
        }
      },
      {
        id: 'q6',
        type: 'checkbox',
        title: 'Dietary Requirements',
        required: false,
        properties: {
          options: [
            { id: 'opt1', label: 'Vegetarian', value: 'vegetarian' },
            { id: 'opt2', label: 'Vegan', value: 'vegan' },
            { id: 'opt3', label: 'Gluten-free', value: 'gluten-free' },
            { id: 'opt4', label: 'No restrictions', value: 'none' },
          ]
        }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        title: "You're Registered!",
        description: 'Check your email for confirmation and event details.',
        required: false,
        properties: {}
      }
    ]
  },
  {
    id: 'employee-satisfaction',
    name: 'Employee Satisfaction',
    description: 'Measure employee engagement and satisfaction levels',
    category: 'hr',
    icon: 'Briefcase',
    color: 'bg-indigo-500',
    questions: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Employee Satisfaction Survey',
        description: 'Your feedback helps us create a better workplace. All responses are anonymous.',
        required: false,
        properties: { buttonText: 'Begin Survey' }
      },
      {
        id: 'q1',
        type: 'scale',
        title: 'Overall, how satisfied are you working here?',
        required: true,
        properties: { min: 1, max: 10 }
      },
      {
        id: 'q2',
        type: 'rating',
        title: 'How would you rate the work-life balance?',
        required: true,
        properties: { max: 5 }
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        title: 'Do you feel valued for your contributions?',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: 'Always', value: 'always' },
            { id: 'opt2', label: 'Often', value: 'often' },
            { id: 'opt3', label: 'Sometimes', value: 'sometimes' },
            { id: 'opt4', label: 'Rarely', value: 'rarely' },
            { id: 'opt5', label: 'Never', value: 'never' },
          ]
        }
      },
      {
        id: 'q4',
        type: 'rating',
        title: 'How would you rate communication from leadership?',
        required: true,
        properties: { max: 5 }
      },
      {
        id: 'q5',
        type: 'yes_no',
        title: 'Do you have the tools and resources needed to do your job well?',
        required: true,
        properties: {}
      },
      {
        id: 'q6',
        type: 'long_text',
        title: 'What could we do to improve your experience?',
        required: false,
        properties: { placeholder: 'Share your suggestions...' }
      },
      {
        id: 'q7',
        type: 'nps',
        title: 'How likely are you to recommend this company as a place to work?',
        required: true,
        properties: { min: 0, max: 10 }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        title: 'Thank You for Your Feedback',
        description: 'Your input is valuable and will help us improve.',
        required: false,
        properties: {}
      }
    ]
  },
  {
    id: 'product-survey',
    name: 'Product Survey',
    description: 'Gather insights about your product from users',
    category: 'survey',
    icon: 'ChartBar',
    color: 'bg-orange-500',
    questions: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Product Feedback Survey',
        description: 'Help us understand how you use our product and how we can make it better.',
        required: false,
        properties: { buttonText: 'Start Survey' }
      },
      {
        id: 'q1',
        type: 'multiple_choice',
        title: 'How often do you use our product?',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: 'Daily', value: 'daily' },
            { id: 'opt2', label: 'Weekly', value: 'weekly' },
            { id: 'opt3', label: 'Monthly', value: 'monthly' },
            { id: 'opt4', label: 'Occasionally', value: 'occasionally' },
          ]
        }
      },
      {
        id: 'q2',
        type: 'checkbox',
        title: 'Which features do you use most?',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: 'Form Builder', value: 'builder' },
            { id: 'opt2', label: 'Analytics', value: 'analytics' },
            { id: 'opt3', label: 'Integrations', value: 'integrations' },
            { id: 'opt4', label: 'Templates', value: 'templates' },
            { id: 'opt5', label: 'Team Collaboration', value: 'collaboration' },
          ]
        }
      },
      {
        id: 'q3',
        type: 'rating',
        title: 'How easy is it to use our product?',
        description: '1 = Very difficult, 5 = Very easy',
        required: true,
        properties: { max: 5 }
      },
      {
        id: 'q4',
        type: 'long_text',
        title: "What's the one feature you wish we had?",
        required: false,
        properties: { placeholder: 'Describe the feature...' }
      },
      {
        id: 'q5',
        type: 'nps',
        title: 'How likely are you to recommend our product?',
        required: true,
        properties: { min: 0, max: 10 }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        title: 'Thanks for Your Input!',
        description: 'Your feedback shapes our product roadmap.',
        required: false,
        properties: {}
      }
    ]
  },
  {
    id: 'order-form',
    name: 'Order Form',
    description: 'Accept orders and collect customer information',
    category: 'order',
    icon: 'ShoppingCart',
    color: 'bg-pink-500',
    questions: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Place Your Order',
        description: 'Fill out the form below to complete your order.',
        required: false,
        properties: { buttonText: 'Start Order' }
      },
      {
        id: 'q1',
        type: 'short_text',
        title: 'Full Name',
        required: true,
        properties: { placeholder: 'Your full name' }
      },
      {
        id: 'q2',
        type: 'email',
        title: 'Email Address',
        required: true,
        properties: { placeholder: 'your@email.com' }
      },
      {
        id: 'q3',
        type: 'phone',
        title: 'Phone Number',
        required: true,
        properties: { placeholder: '+1 (555) 123-4567' }
      },
      {
        id: 'q4',
        type: 'dropdown',
        title: 'Select Product',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: 'Product A - $29', value: 'product_a' },
            { id: 'opt2', label: 'Product B - $49', value: 'product_b' },
            { id: 'opt3', label: 'Product C - $99', value: 'product_c' },
          ]
        }
      },
      {
        id: 'q5',
        type: 'number',
        title: 'Quantity',
        required: true,
        properties: { min: 1, max: 100, placeholder: '1' }
      },
      {
        id: 'q6',
        type: 'address',
        title: 'Shipping Address',
        required: true,
        properties: {}
      },
      {
        id: 'q7',
        type: 'long_text',
        title: 'Special Instructions',
        required: false,
        properties: { placeholder: 'Any special requests...' }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        title: 'Order Received!',
        description: "Thank you for your order. You'll receive a confirmation email shortly.",
        required: false,
        properties: {}
      }
    ]
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Collect applications from job candidates',
    category: 'hr',
    icon: 'UserCircle',
    color: 'bg-teal-500',
    questions: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Job Application',
        description: "We're excited you're interested in joining our team!",
        required: false,
        properties: { buttonText: 'Apply Now' }
      },
      {
        id: 'q1',
        type: 'short_text',
        title: 'Full Name',
        required: true,
        properties: { placeholder: 'Your full name' }
      },
      {
        id: 'q2',
        type: 'email',
        title: 'Email Address',
        required: true,
        properties: { placeholder: 'your@email.com' }
      },
      {
        id: 'q3',
        type: 'phone',
        title: 'Phone Number',
        required: true,
        properties: { placeholder: '+1 (555) 123-4567' }
      },
      {
        id: 'q4',
        type: 'url',
        title: 'LinkedIn Profile',
        required: false,
        properties: { placeholder: 'https://linkedin.com/in/...' }
      },
      {
        id: 'q5',
        type: 'url',
        title: 'Portfolio / Website',
        required: false,
        properties: { placeholder: 'https://...' }
      },
      {
        id: 'q6',
        type: 'dropdown',
        title: 'Years of Experience',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: '0-1 years', value: '0-1' },
            { id: 'opt2', label: '2-4 years', value: '2-4' },
            { id: 'opt3', label: '5-7 years', value: '5-7' },
            { id: 'opt4', label: '8+ years', value: '8+' },
          ]
        }
      },
      {
        id: 'q7',
        type: 'file_upload',
        title: 'Upload Resume',
        description: 'PDF or Word document (max 5MB)',
        required: true,
        properties: { 
          acceptedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          maxFileSize: 5,
          maxFiles: 1
        }
      },
      {
        id: 'q8',
        type: 'long_text',
        title: 'Why do you want to join our team?',
        required: true,
        properties: { placeholder: 'Tell us about yourself and why you would be a great fit...' }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        title: 'Application Submitted!',
        description: "Thank you for applying. We'll review your application and get back to you soon.",
        required: false,
        properties: {}
      }
    ]
  },
  {
    id: 'quiz',
    name: 'Quiz / Assessment',
    description: 'Create quizzes or assessments with scoring',
    category: 'quiz',
    icon: 'Brain',
    color: 'bg-yellow-500',
    questions: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Knowledge Quiz',
        description: 'Test your knowledge with this quick quiz. Good luck!',
        required: false,
        properties: { buttonText: 'Start Quiz' }
      },
      {
        id: 'q1',
        type: 'short_text',
        title: 'Your Name',
        required: true,
        properties: { placeholder: 'Enter your name' }
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        title: 'Question 1: What is the capital of France?',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: 'London', value: 'london' },
            { id: 'opt2', label: 'Berlin', value: 'berlin' },
            { id: 'opt3', label: 'Paris', value: 'paris' },
            { id: 'opt4', label: 'Madrid', value: 'madrid' },
          ]
        }
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        title: 'Question 2: Which planet is known as the Red Planet?',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: 'Venus', value: 'venus' },
            { id: 'opt2', label: 'Mars', value: 'mars' },
            { id: 'opt3', label: 'Jupiter', value: 'jupiter' },
            { id: 'opt4', label: 'Saturn', value: 'saturn' },
          ]
        }
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        title: 'Question 3: What year did World War II end?',
        required: true,
        properties: {
          options: [
            { id: 'opt1', label: '1943', value: '1943' },
            { id: 'opt2', label: '1944', value: '1944' },
            { id: 'opt3', label: '1945', value: '1945' },
            { id: 'opt4', label: '1946', value: '1946' },
          ]
        }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        title: 'Quiz Complete!',
        description: "You've completed the quiz. Your results will be shared soon.",
        required: false,
        properties: {}
      }
    ]
  },
  // Template 9: Website Feedback
  {
    id: 'website-feedback',
    name: 'Website Feedback',
    description: 'Gather user feedback about your website experience',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-cyan-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Help Us Improve', description: 'Share your thoughts about our website', required: false, properties: { buttonText: 'Start' } },
      { id: 'q1', type: 'rating', title: 'How would you rate the overall website experience?', required: true, properties: { max: 5 } },
      { id: 'q2', type: 'multiple_choice', title: 'What brought you to our website today?', required: true, properties: { options: [{ id: 'o1', label: 'Research', value: 'research' }, { id: 'o2', label: 'Purchase', value: 'purchase' }, { id: 'o3', label: 'Support', value: 'support' }, { id: 'o4', label: 'Just browsing', value: 'browsing' }] } },
      { id: 'q3', type: 'yes_no', title: 'Did you find what you were looking for?', required: true, properties: {} },
      { id: 'q4', type: 'long_text', title: 'Any suggestions for improvement?', required: false, properties: { placeholder: 'Your feedback...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thanks!', description: 'Your feedback helps us improve.', required: false, properties: {} }
    ]
  },
  // Template 10: Newsletter Signup
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    description: 'Grow your email list with a simple signup form',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-violet-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Stay Updated', description: 'Subscribe to our newsletter for the latest updates', required: false, properties: { buttonText: 'Subscribe' } },
      { id: 'q1', type: 'short_text', title: 'First Name', required: true, properties: { placeholder: 'Your first name' } },
      { id: 'q2', type: 'email', title: 'Email Address', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'checkbox', title: 'What topics interest you?', required: false, properties: { options: [{ id: 'o1', label: 'Product Updates', value: 'products' }, { id: 'o2', label: 'Tips & Tutorials', value: 'tips' }, { id: 'o3', label: 'Industry News', value: 'news' }, { id: 'o4', label: 'Special Offers', value: 'offers' }] } },
      { id: 'thank-you', type: 'thank_you', title: "You're Subscribed!", description: 'Check your inbox for a confirmation email.', required: false, properties: {} }
    ]
  },
  // Template 11: Bug Report
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Allow users to report bugs and issues',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-red-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Report a Bug', description: 'Help us fix issues by providing details', required: false, properties: { buttonText: 'Report Bug' } },
      { id: 'q1', type: 'short_text', title: 'Bug Title', description: 'Brief summary of the issue', required: true, properties: { placeholder: 'e.g., Button not working on checkout' } },
      { id: 'q2', type: 'dropdown', title: 'Severity', required: true, properties: { options: [{ id: 'o1', label: 'Critical - App unusable', value: 'critical' }, { id: 'o2', label: 'High - Major feature broken', value: 'high' }, { id: 'o3', label: 'Medium - Minor issue', value: 'medium' }, { id: 'o4', label: 'Low - Cosmetic', value: 'low' }] } },
      { id: 'q3', type: 'long_text', title: 'Steps to Reproduce', required: true, properties: { placeholder: '1. Go to...\n2. Click on...\n3. See error' } },
      { id: 'q4', type: 'long_text', title: 'Expected vs Actual Behavior', required: true, properties: { placeholder: 'Expected: ...\nActual: ...' } },
      { id: 'q5', type: 'email', title: 'Your Email (for follow-up)', required: false, properties: { placeholder: 'your@email.com' } },
      { id: 'thank-you', type: 'thank_you', title: 'Bug Reported', description: 'Thanks for helping us improve!', required: false, properties: {} }
    ]
  },
  // Template 12: Appointment Booking
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    description: 'Let clients book appointments or consultations',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-sky-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Book an Appointment', description: 'Schedule your consultation', required: false, properties: { buttonText: 'Book Now' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email Address', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone Number', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'date', title: 'Preferred Date', required: true, properties: {} },
      { id: 'q5', type: 'dropdown', title: 'Preferred Time', required: true, properties: { options: [{ id: 'o1', label: '9:00 AM', value: '9am' }, { id: 'o2', label: '10:00 AM', value: '10am' }, { id: 'o3', label: '11:00 AM', value: '11am' }, { id: 'o4', label: '2:00 PM', value: '2pm' }, { id: 'o5', label: '3:00 PM', value: '3pm' }, { id: 'o6', label: '4:00 PM', value: '4pm' }] } },
      { id: 'q6', type: 'long_text', title: 'Reason for appointment', required: false, properties: { placeholder: 'Tell us how we can help...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Appointment Requested', description: "We'll confirm your booking via email.", required: false, properties: {} }
    ]
  },
  // Template 13: Exit Interview
  {
    id: 'exit-interview',
    name: 'Exit Interview',
    description: 'Gather feedback from departing employees',
    category: 'hr',
    icon: 'Briefcase',
    color: 'bg-slate-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Exit Interview', description: 'Your feedback helps us improve', required: false, properties: { buttonText: 'Start' } },
      { id: 'q1', type: 'dropdown', title: 'Primary reason for leaving', required: true, properties: { options: [{ id: 'o1', label: 'New opportunity', value: 'opportunity' }, { id: 'o2', label: 'Compensation', value: 'compensation' }, { id: 'o3', label: 'Work-life balance', value: 'balance' }, { id: 'o4', label: 'Management', value: 'management' }, { id: 'o5', label: 'Career growth', value: 'growth' }, { id: 'o6', label: 'Relocation', value: 'relocation' }] } },
      { id: 'q2', type: 'rating', title: 'How would you rate your overall experience?', required: true, properties: { max: 5 } },
      { id: 'q3', type: 'rating', title: 'How would you rate your manager?', required: true, properties: { max: 5 } },
      { id: 'q4', type: 'yes_no', title: 'Would you recommend this company to others?', required: true, properties: {} },
      { id: 'q5', type: 'long_text', title: 'What could we have done to keep you?', required: false, properties: { placeholder: 'Your thoughts...' } },
      { id: 'q6', type: 'long_text', title: 'Any other feedback?', required: false, properties: { placeholder: 'Share your experience...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thank You', description: 'We wish you the best in your future endeavors.', required: false, properties: {} }
    ]
  },
  // Template 14: Market Research
  {
    id: 'market-research',
    name: 'Market Research',
    description: 'Conduct market research and gather insights',
    category: 'survey',
    icon: 'ChartBar',
    color: 'bg-fuchsia-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Market Research Survey', description: 'Help us understand your preferences', required: false, properties: { buttonText: 'Begin' } },
      { id: 'q1', type: 'dropdown', title: 'Age Group', required: true, properties: { options: [{ id: 'o1', label: '18-24', value: '18-24' }, { id: 'o2', label: '25-34', value: '25-34' }, { id: 'o3', label: '35-44', value: '35-44' }, { id: 'o4', label: '45-54', value: '45-54' }, { id: 'o5', label: '55+', value: '55+' }] } },
      { id: 'q2', type: 'multiple_choice', title: 'How often do you purchase products in this category?', required: true, properties: { options: [{ id: 'o1', label: 'Weekly', value: 'weekly' }, { id: 'o2', label: 'Monthly', value: 'monthly' }, { id: 'o3', label: 'Quarterly', value: 'quarterly' }, { id: 'o4', label: 'Rarely', value: 'rarely' }] } },
      { id: 'q3', type: 'checkbox', title: 'What factors influence your purchase decision?', required: true, properties: { options: [{ id: 'o1', label: 'Price', value: 'price' }, { id: 'o2', label: 'Quality', value: 'quality' }, { id: 'o3', label: 'Brand', value: 'brand' }, { id: 'o4', label: 'Reviews', value: 'reviews' }] } },
      { id: 'q4', type: 'scale', title: 'How likely are you to try a new brand?', required: true, properties: { min: 1, max: 10 } },
      { id: 'q5', type: 'long_text', title: 'What would make you switch brands?', required: false, properties: { placeholder: 'Your thoughts...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Survey Complete', description: 'Thank you for your valuable insights.', required: false, properties: {} }
    ]
  },
  // Template 15: Webinar Registration
  {
    id: 'webinar-registration',
    name: 'Webinar Registration',
    description: 'Register attendees for your webinar',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-rose-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Webinar Registration', description: 'Reserve your spot for our upcoming webinar', required: false, properties: { buttonText: 'Register' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email Address', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'short_text', title: 'Company', required: false, properties: { placeholder: 'Your company' } },
      { id: 'q4', type: 'short_text', title: 'Job Title', required: false, properties: { placeholder: 'Your role' } },
      { id: 'q5', type: 'long_text', title: 'What questions would you like addressed?', required: false, properties: { placeholder: 'Topics you want covered...' } },
      { id: 'thank-you', type: 'thank_you', title: "You're Registered!", description: 'Check your email for the webinar link.', required: false, properties: {} }
    ]
  },
  // Template 16: Service Request
  {
    id: 'service-request',
    name: 'Service Request',
    description: 'Accept service requests from customers',
    category: 'order',
    icon: 'ShoppingCart',
    color: 'bg-orange-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Request a Service', description: 'Tell us what you need', required: false, properties: { buttonText: 'Get Started' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'dropdown', title: 'Service Type', required: true, properties: { options: [{ id: 'o1', label: 'Consultation', value: 'consultation' }, { id: 'o2', label: 'Installation', value: 'installation' }, { id: 'o3', label: 'Repair', value: 'repair' }, { id: 'o4', label: 'Maintenance', value: 'maintenance' }] } },
      { id: 'q5', type: 'date', title: 'Preferred Date', required: true, properties: {} },
      { id: 'q6', type: 'long_text', title: 'Describe your needs', required: true, properties: { placeholder: 'Tell us more...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Request Received', description: "We'll contact you shortly.", required: false, properties: {} }
    ]
  },
  // Template 17: Post-Event Survey
  {
    id: 'post-event-survey',
    name: 'Post-Event Survey',
    description: 'Gather feedback after your event',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-indigo-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Event Feedback', description: 'Tell us about your experience', required: false, properties: { buttonText: 'Share Feedback' } },
      { id: 'q1', type: 'rating', title: 'Overall event rating', required: true, properties: { max: 5 } },
      { id: 'q2', type: 'rating', title: 'Speaker/Presenter quality', required: true, properties: { max: 5 } },
      { id: 'q3', type: 'rating', title: 'Venue/Platform quality', required: true, properties: { max: 5 } },
      { id: 'q4', type: 'multiple_choice', title: 'What did you enjoy most?', required: false, properties: { options: [{ id: 'o1', label: 'Content', value: 'content' }, { id: 'o2', label: 'Networking', value: 'networking' }, { id: 'o3', label: 'Speakers', value: 'speakers' }, { id: 'o4', label: 'Q&A Sessions', value: 'qa' }] } },
      { id: 'q5', type: 'yes_no', title: 'Would you attend future events?', required: true, properties: {} },
      { id: 'q6', type: 'long_text', title: 'Suggestions for improvement', required: false, properties: { placeholder: 'Your feedback...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thanks!', description: 'Your feedback helps us plan better events.', required: false, properties: {} }
    ]
  },
  // Template 18: Trivia Quiz
  {
    id: 'trivia-quiz',
    name: 'Trivia Quiz',
    description: 'Fun trivia quiz for engagement',
    category: 'quiz',
    icon: 'Brain',
    color: 'bg-pink-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Trivia Time!', description: 'Test your knowledge with our fun quiz', required: false, properties: { buttonText: 'Play Now' } },
      { id: 'q1', type: 'short_text', title: 'Your Name', required: true, properties: { placeholder: 'Enter your name' } },
      { id: 'q2', type: 'multiple_choice', title: 'Which planet is closest to the sun?', required: true, properties: { options: [{ id: 'o1', label: 'Venus', value: 'venus' }, { id: 'o2', label: 'Mercury', value: 'mercury' }, { id: 'o3', label: 'Earth', value: 'earth' }, { id: 'o4', label: 'Mars', value: 'mars' }] } },
      { id: 'q3', type: 'multiple_choice', title: 'Who painted the Mona Lisa?', required: true, properties: { options: [{ id: 'o1', label: 'Van Gogh', value: 'vangogh' }, { id: 'o2', label: 'Picasso', value: 'picasso' }, { id: 'o3', label: 'Da Vinci', value: 'davinci' }, { id: 'o4', label: 'Monet', value: 'monet' }] } },
      { id: 'q4', type: 'multiple_choice', title: 'What is the capital of Australia?', required: true, properties: { options: [{ id: 'o1', label: 'Sydney', value: 'sydney' }, { id: 'o2', label: 'Melbourne', value: 'melbourne' }, { id: 'o3', label: 'Canberra', value: 'canberra' }, { id: 'o4', label: 'Perth', value: 'perth' }] } },
      { id: 'q5', type: 'multiple_choice', title: 'How many continents are there?', required: true, properties: { options: [{ id: 'o1', label: '5', value: '5' }, { id: 'o2', label: '6', value: '6' }, { id: 'o3', label: '7', value: '7' }, { id: 'o4', label: '8', value: '8' }] } },
      { id: 'thank-you', type: 'thank_you', title: 'Quiz Complete!', description: 'Thanks for playing!', required: false, properties: {} }
    ]
  },
  // Template 19: Quote Request
  {
    id: 'quote-request',
    name: 'Quote Request',
    description: 'Accept quote requests from potential clients',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-sky-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Request a Quote', description: 'Get a custom quote for your project', required: false, properties: { buttonText: 'Get Quote' } },
      { id: 'q1', type: 'short_text', title: 'Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'short_text', title: 'Company', required: false, properties: { placeholder: 'Your company' } },
      { id: 'q3', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q4', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q5', type: 'dropdown', title: 'Service needed', required: true, properties: { options: [{ id: 'o1', label: 'Web Development', value: 'web' }, { id: 'o2', label: 'Mobile App', value: 'mobile' }, { id: 'o3', label: 'Design', value: 'design' }, { id: 'o4', label: 'Consulting', value: 'consulting' }] } },
      { id: 'q6', type: 'dropdown', title: 'Budget range', required: true, properties: { options: [{ id: 'o1', label: 'Under $5,000', value: 'under5k' }, { id: 'o2', label: '$5,000 - $10,000', value: '5k-10k' }, { id: 'o3', label: '$10,000 - $25,000', value: '10k-25k' }, { id: 'o4', label: '$25,000+', value: '25k+' }] } },
      { id: 'q7', type: 'long_text', title: 'Project description', required: true, properties: { placeholder: 'Tell us about your project...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Quote Request Received', description: "We'll get back to you within 24 hours.", required: false, properties: {} }
    ]
  },
  // Template 20: Training Evaluation
  {
    id: 'training-evaluation',
    name: 'Training Evaluation',
    description: 'Evaluate training sessions and workshops',
    category: 'hr',
    icon: 'Briefcase',
    color: 'bg-cyan-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Training Feedback', description: 'Help us improve our training programs', required: false, properties: { buttonText: 'Begin' } },
      { id: 'q1', type: 'short_text', title: 'Training Session Name', required: true, properties: { placeholder: 'Name of the training' } },
      { id: 'q2', type: 'rating', title: 'Overall training quality', required: true, properties: { max: 5 } },
      { id: 'q3', type: 'rating', title: 'Trainer effectiveness', required: true, properties: { max: 5 } },
      { id: 'q4', type: 'rating', title: 'Content relevance', required: true, properties: { max: 5 } },
      { id: 'q5', type: 'yes_no', title: 'Will you apply what you learned?', required: true, properties: {} },
      { id: 'q6', type: 'long_text', title: 'What could be improved?', required: false, properties: { placeholder: 'Your suggestions...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Feedback Received', description: 'Thank you for helping us improve.', required: false, properties: {} }
    ]
  },
  // Template 21: Product Return
  {
    id: 'product-return',
    name: 'Product Return Request',
    description: 'Process product return requests',
    category: 'order',
    icon: 'ShoppingCart',
    color: 'bg-amber-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Return Request', description: 'Start your return process', required: false, properties: { buttonText: 'Start Return' } },
      { id: 'q1', type: 'short_text', title: 'Order Number', required: true, properties: { placeholder: '#12345' } },
      { id: 'q2', type: 'email', title: 'Email used for order', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'dropdown', title: 'Reason for return', required: true, properties: { options: [{ id: 'o1', label: 'Wrong item', value: 'wrong' }, { id: 'o2', label: 'Damaged', value: 'damaged' }, { id: 'o3', label: 'Not as described', value: 'description' }, { id: 'o4', label: 'Changed mind', value: 'changed' }] } },
      { id: 'q4', type: 'long_text', title: 'Additional details', required: false, properties: { placeholder: 'Describe the issue...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Return Initiated', description: "You'll receive return instructions via email.", required: false, properties: {} }
    ]
  },
  // Template 22: Conference Registration
  {
    id: 'conference-registration',
    name: 'Conference Registration',
    description: 'Register attendees for your conference',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-blue-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Conference Registration', description: 'Join us for our annual conference', required: false, properties: { buttonText: 'Register' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'short_text', title: 'Organization', required: true, properties: { placeholder: 'Your company/organization' } },
      { id: 'q4', type: 'short_text', title: 'Job Title', required: true, properties: { placeholder: 'Your role' } },
      { id: 'q5', type: 'dropdown', title: 'Ticket Type', required: true, properties: { options: [{ id: 'o1', label: 'General Admission - $199', value: 'general' }, { id: 'o2', label: 'VIP - $499', value: 'vip' }, { id: 'o3', label: 'Student - $99', value: 'student' }] } },
      { id: 'q6', type: 'checkbox', title: 'Which sessions interest you?', required: false, properties: { options: [{ id: 'o1', label: 'Keynote', value: 'keynote' }, { id: 'o2', label: 'Workshops', value: 'workshops' }, { id: 'o3', label: 'Networking', value: 'networking' }, { id: 'o4', label: 'Panel Discussions', value: 'panels' }] } },
      { id: 'thank-you', type: 'thank_you', title: 'Registration Complete!', description: 'Check your email for confirmation.', required: false, properties: {} }
    ]
  },
  // Template 23: Client Satisfaction
  {
    id: 'client-satisfaction',
    name: 'Client Satisfaction',
    description: 'Measure client satisfaction with your services',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-emerald-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Client Satisfaction Survey', description: 'Your feedback is valuable to us', required: false, properties: { buttonText: 'Start Survey' } },
      { id: 'q1', type: 'rating', title: 'Overall satisfaction with our services', required: true, properties: { max: 5 } },
      { id: 'q2', type: 'rating', title: 'Quality of work delivered', required: true, properties: { max: 5 } },
      { id: 'q3', type: 'rating', title: 'Communication and responsiveness', required: true, properties: { max: 5 } },
      { id: 'q4', type: 'rating', title: 'Value for money', required: true, properties: { max: 5 } },
      { id: 'q5', type: 'yes_no', title: 'Would you work with us again?', required: true, properties: {} },
      { id: 'q6', type: 'scale', title: 'How likely are you to recommend us?', required: true, properties: { min: 0, max: 10 } },
      { id: 'q7', type: 'long_text', title: 'Any additional comments?', required: false, properties: { placeholder: 'Your feedback...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thank You!', description: 'We appreciate your business.', required: false, properties: {} }
    ]
  },
  // Template 24: Internship Application
  {
    id: 'internship-application',
    name: 'Internship Application',
    description: 'Accept applications from internship candidates',
    category: 'hr',
    icon: 'Briefcase',
    color: 'bg-violet-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Internship Application', description: 'Start your career with us', required: false, properties: { buttonText: 'Apply' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'short_text', title: 'University/College', required: true, properties: { placeholder: 'Your school' } },
      { id: 'q5', type: 'short_text', title: 'Major/Field of Study', required: true, properties: { placeholder: 'Your major' } },
      { id: 'q6', type: 'dropdown', title: 'Expected Graduation', required: true, properties: { options: [{ id: 'o1', label: '2026', value: '2026' }, { id: 'o2', label: '2027', value: '2027' }, { id: 'o3', label: '2028', value: '2028' }, { id: 'o4', label: '2029', value: '2029' }] } },
      { id: 'q7', type: 'long_text', title: 'Why do you want this internship?', required: true, properties: { placeholder: 'Tell us about yourself...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Application Received!', description: "We'll review and contact you soon.", required: false, properties: {} }
    ]
  },
  // Template 25: Donation Form
  {
    id: 'donation-form',
    name: 'Donation Form',
    description: 'Accept donations for your cause',
    category: 'order',
    icon: 'ShoppingCart',
    color: 'bg-red-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Make a Difference', description: 'Your donation supports our mission', required: false, properties: { buttonText: 'Donate Now' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'dropdown', title: 'Donation Amount', required: true, properties: { options: [{ id: 'o1', label: '$10', value: '10' }, { id: 'o2', label: '$25', value: '25' }, { id: 'o3', label: '$50', value: '50' }, { id: 'o4', label: '$100', value: '100' }, { id: 'o5', label: 'Custom Amount', value: 'custom' }] } },
      { id: 'q4', type: 'yes_no', title: 'Make this a monthly donation?', required: true, properties: {} },
      { id: 'q5', type: 'long_text', title: 'Leave a message (optional)', required: false, properties: { placeholder: 'Share why you support us...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thank You!', description: 'Your generosity makes a difference.', required: false, properties: {} }
    ]
  },
  // Template 26: Fitness Assessment
  {
    id: 'fitness-assessment',
    name: 'Fitness Assessment',
    description: 'Assess client fitness levels and goals',
    category: 'survey',
    icon: 'ChartBar',
    color: 'bg-green-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Fitness Assessment', description: 'Let us help you reach your goals', required: false, properties: { buttonText: 'Begin' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'number', title: 'Age', required: true, properties: { min: 16, max: 100 } },
      { id: 'q4', type: 'dropdown', title: 'Current fitness level', required: true, properties: { options: [{ id: 'o1', label: 'Beginner', value: 'beginner' }, { id: 'o2', label: 'Intermediate', value: 'intermediate' }, { id: 'o3', label: 'Advanced', value: 'advanced' }] } },
      { id: 'q5', type: 'checkbox', title: 'Fitness goals', required: true, properties: { options: [{ id: 'o1', label: 'Lose weight', value: 'weight' }, { id: 'o2', label: 'Build muscle', value: 'muscle' }, { id: 'o3', label: 'Improve endurance', value: 'endurance' }, { id: 'o4', label: 'Overall health', value: 'health' }] } },
      { id: 'q6', type: 'multiple_choice', title: 'How often do you exercise?', required: true, properties: { options: [{ id: 'o1', label: 'Never', value: 'never' }, { id: 'o2', label: '1-2x per week', value: '1-2' }, { id: 'o3', label: '3-4x per week', value: '3-4' }, { id: 'o4', label: '5+ times per week', value: '5+' }] } },
      { id: 'thank-you', type: 'thank_you', title: 'Assessment Complete', description: "We'll create your personalized plan.", required: false, properties: {} }
    ]
  },
  // Template 27: Restaurant Feedback
  {
    id: 'restaurant-feedback',
    name: 'Restaurant Feedback',
    description: 'Collect feedback from diners',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-orange-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Dining Feedback', description: 'Tell us about your experience', required: false, properties: { buttonText: 'Share Feedback' } },
      { id: 'q1', type: 'date', title: 'Date of visit', required: true, properties: {} },
      { id: 'q2', type: 'rating', title: 'Food quality', required: true, properties: { max: 5 } },
      { id: 'q3', type: 'rating', title: 'Service', required: true, properties: { max: 5 } },
      { id: 'q4', type: 'rating', title: 'Ambiance', required: true, properties: { max: 5 } },
      { id: 'q5', type: 'rating', title: 'Value for money', required: true, properties: { max: 5 } },
      { id: 'q6', type: 'yes_no', title: 'Would you visit again?', required: true, properties: {} },
      { id: 'q7', type: 'long_text', title: 'Comments or suggestions', required: false, properties: { placeholder: 'Your feedback...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thanks!', description: 'We hope to see you again!', required: false, properties: {} }
    ]
  },
  // Template 28: Personality Quiz
  {
    id: 'personality-quiz',
    name: 'Personality Quiz',
    description: 'Fun personality assessment quiz',
    category: 'quiz',
    icon: 'Brain',
    color: 'bg-fuchsia-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Discover Your Personality', description: 'Answer a few questions to learn about yourself', required: false, properties: { buttonText: 'Start Quiz' } },
      { id: 'q1', type: 'short_text', title: 'Your Name', required: true, properties: { placeholder: 'Enter your name' } },
      { id: 'q2', type: 'multiple_choice', title: 'How do you prefer to spend a weekend?', required: true, properties: { options: [{ id: 'o1', label: 'At home relaxing', value: 'home' }, { id: 'o2', label: 'Out with friends', value: 'friends' }, { id: 'o3', label: 'Trying something new', value: 'adventure' }, { id: 'o4', label: 'Working on projects', value: 'projects' }] } },
      { id: 'q3', type: 'multiple_choice', title: 'When faced with a problem, you usually:', required: true, properties: { options: [{ id: 'o1', label: 'Analyze it logically', value: 'logic' }, { id: 'o2', label: 'Trust your gut feeling', value: 'intuition' }, { id: 'o3', label: 'Ask others for advice', value: 'advice' }, { id: 'o4', label: 'Sleep on it', value: 'wait' }] } },
      { id: 'q4', type: 'multiple_choice', title: 'In a group project, you are usually:', required: true, properties: { options: [{ id: 'o1', label: 'The leader', value: 'leader' }, { id: 'o2', label: 'The creative one', value: 'creative' }, { id: 'o3', label: 'The organizer', value: 'organizer' }, { id: 'o4', label: 'The mediator', value: 'mediator' }] } },
      { id: 'q5', type: 'scale', title: 'How adventurous are you?', required: true, properties: { min: 1, max: 10 } },
      { id: 'thank-you', type: 'thank_you', title: 'Quiz Complete!', description: 'Check your results!', required: false, properties: {} }
    ]
  },
  // Template 29: Tech Support
  {
    id: 'tech-support',
    name: 'Tech Support Request',
    description: 'Collect technical support requests',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-slate-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Tech Support', description: 'We are here to help', required: false, properties: { buttonText: 'Get Help' } },
      { id: 'q1', type: 'short_text', title: 'Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'dropdown', title: 'Issue Category', required: true, properties: { options: [{ id: 'o1', label: 'Account Access', value: 'access' }, { id: 'o2', label: 'Technical Error', value: 'error' }, { id: 'o3', label: 'How-to Question', value: 'howto' }, { id: 'o4', label: 'Billing', value: 'billing' }] } },
      { id: 'q4', type: 'dropdown', title: 'Priority', required: true, properties: { options: [{ id: 'o1', label: 'Low', value: 'low' }, { id: 'o2', label: 'Medium', value: 'medium' }, { id: 'o3', label: 'High', value: 'high' }, { id: 'o4', label: 'Critical', value: 'critical' }] } },
      { id: 'q5', type: 'long_text', title: 'Describe your issue', required: true, properties: { placeholder: 'Please describe in detail...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Request Submitted', description: "We'll respond within 24 hours.", required: false, properties: {} }
    ]
  },
  // Template 30: Vendor Application
  {
    id: 'vendor-application',
    name: 'Vendor Application',
    description: 'Accept applications from potential vendors',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-purple-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Become a Vendor', description: 'Apply to join our vendor network', required: false, properties: { buttonText: 'Apply Now' } },
      { id: 'q1', type: 'short_text', title: 'Company Name', required: true, properties: { placeholder: 'Your company' } },
      { id: 'q2', type: 'short_text', title: 'Contact Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q3', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q4', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q5', type: 'url', title: 'Website', required: false, properties: { placeholder: 'https://...' } },
      { id: 'q6', type: 'checkbox', title: 'Products/Services offered', required: true, properties: { options: [{ id: 'o1', label: 'Electronics', value: 'electronics' }, { id: 'o2', label: 'Clothing', value: 'clothing' }, { id: 'o3', label: 'Food & Beverage', value: 'food' }, { id: 'o4', label: 'Services', value: 'services' }] } },
      { id: 'q7', type: 'long_text', title: 'Tell us about your business', required: true, properties: { placeholder: 'Company description...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Application Submitted', description: "We'll review and get back to you.", required: false, properties: {} }
    ]
  },
  // Template 31: Customer Onboarding
  {
    id: 'customer-onboarding',
    name: 'Customer Onboarding',
    description: 'Gather information from new customers',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-teal-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Welcome Aboard!', description: 'Help us get you set up', required: false, properties: { buttonText: 'Get Started' } },
      { id: 'q1', type: 'short_text', title: 'Company Name', required: true, properties: { placeholder: 'Your company' } },
      { id: 'q2', type: 'short_text', title: 'Your Name', required: true, properties: { placeholder: 'Your full name' } },
      { id: 'q3', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q4', type: 'dropdown', title: 'Company Size', required: true, properties: { options: [{ id: 'o1', label: '1-10', value: '1-10' }, { id: 'o2', label: '11-50', value: '11-50' }, { id: 'o3', label: '51-200', value: '51-200' }, { id: 'o4', label: '200+', value: '200+' }] } },
      { id: 'q5', type: 'multiple_choice', title: 'Primary goal', required: true, properties: { options: [{ id: 'o1', label: 'Increase sales', value: 'sales' }, { id: 'o2', label: 'Improve efficiency', value: 'efficiency' }, { id: 'o3', label: 'Better insights', value: 'insights' }, { id: 'o4', label: 'Cost reduction', value: 'cost' }] } },
      { id: 'q6', type: 'long_text', title: 'Any specific requirements?', required: false, properties: { placeholder: 'Tell us more...' } },
      { id: 'thank-you', type: 'thank_you', title: 'All Set!', description: 'Our team will reach out shortly.', required: false, properties: {} }
    ]
  },
  // Template 32: Workshop Feedback
  {
    id: 'workshop-feedback',
    name: 'Workshop Feedback',
    description: 'Gather feedback after workshops',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-violet-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Workshop Feedback', description: 'Share your thoughts on the workshop', required: false, properties: { buttonText: 'Give Feedback' } },
      { id: 'q1', type: 'short_text', title: 'Workshop Name', required: true, properties: { placeholder: 'Name of workshop attended' } },
      { id: 'q2', type: 'date', title: 'Date Attended', required: true, properties: {} },
      { id: 'q3', type: 'rating', title: 'Overall rating', required: true, properties: { max: 5 } },
      { id: 'q4', type: 'rating', title: 'Instructor knowledge', required: true, properties: { max: 5 } },
      { id: 'q5', type: 'rating', title: 'Materials and resources', required: true, properties: { max: 5 } },
      { id: 'q6', type: 'yes_no', title: 'Met your expectations?', required: true, properties: {} },
      { id: 'q7', type: 'long_text', title: 'What did you learn?', required: false, properties: { placeholder: 'Key takeaways...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thanks!', description: 'Your feedback helps us improve.', required: false, properties: {} }
    ]
  },
  // Template 33: Catering Order
  {
    id: 'catering-order',
    name: 'Catering Order',
    description: 'Accept catering orders for events',
    category: 'order',
    icon: 'ShoppingCart',
    color: 'bg-rose-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Catering Order', description: 'Place your catering order', required: false, properties: { buttonText: 'Order Now' } },
      { id: 'q1', type: 'short_text', title: 'Contact Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'date', title: 'Event Date', required: true, properties: {} },
      { id: 'q5', type: 'dropdown', title: 'Event Time', required: true, properties: { options: [{ id: 'o1', label: 'Breakfast (7-10 AM)', value: 'breakfast' }, { id: 'o2', label: 'Lunch (11 AM-2 PM)', value: 'lunch' }, { id: 'o3', label: 'Dinner (5-9 PM)', value: 'dinner' }] } },
      { id: 'q6', type: 'number', title: 'Number of Guests', required: true, properties: { min: 10, max: 500 } },
      { id: 'q7', type: 'checkbox', title: 'Menu Selection', required: true, properties: { options: [{ id: 'o1', label: 'Appetizers', value: 'appetizers' }, { id: 'o2', label: 'Main Courses', value: 'mains' }, { id: 'o3', label: 'Desserts', value: 'desserts' }, { id: 'o4', label: 'Beverages', value: 'beverages' }] } },
      { id: 'q8', type: 'long_text', title: 'Special requests', required: false, properties: { placeholder: 'Dietary restrictions, allergies, etc.' } },
      { id: 'thank-you', type: 'thank_you', title: 'Order Received', description: "We'll confirm your order shortly.", required: false, properties: {} }
    ]
  },
  // Template 34: Volunteer Signup
  {
    id: 'volunteer-signup',
    name: 'Volunteer Signup',
    description: 'Recruit volunteers for your cause',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-lime-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Volunteer With Us', description: 'Make a difference in your community', required: false, properties: { buttonText: 'Sign Up' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'checkbox', title: 'Areas of Interest', required: true, properties: { options: [{ id: 'o1', label: 'Event Support', value: 'events' }, { id: 'o2', label: 'Administrative', value: 'admin' }, { id: 'o3', label: 'Outreach', value: 'outreach' }, { id: 'o4', label: 'Fundraising', value: 'fundraising' }] } },
      { id: 'q5', type: 'dropdown', title: 'Availability', required: true, properties: { options: [{ id: 'o1', label: 'Weekday mornings', value: 'weekday-am' }, { id: 'o2', label: 'Weekday afternoons', value: 'weekday-pm' }, { id: 'o3', label: 'Weekends', value: 'weekends' }, { id: 'o4', label: 'Flexible', value: 'flexible' }] } },
      { id: 'q6', type: 'long_text', title: 'Why do you want to volunteer?', required: false, properties: { placeholder: 'Tell us about yourself...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thank You!', description: "We'll be in touch about opportunities.", required: false, properties: {} }
    ]
  },
  // Template 35: Performance Review
  {
    id: 'performance-review',
    name: 'Performance Review',
    description: 'Employee self-assessment form',
    category: 'hr',
    icon: 'Briefcase',
    color: 'bg-emerald-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Performance Review', description: 'Complete your self-assessment', required: false, properties: { buttonText: 'Begin' } },
      { id: 'q1', type: 'short_text', title: 'Your Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'short_text', title: 'Department', required: true, properties: { placeholder: 'Your department' } },
      { id: 'q3', type: 'short_text', title: 'Manager Name', required: true, properties: { placeholder: "Your manager's name" } },
      { id: 'q4', type: 'long_text', title: 'Key accomplishments this period', required: true, properties: { placeholder: 'List your achievements...' } },
      { id: 'q5', type: 'long_text', title: 'Challenges faced', required: true, properties: { placeholder: 'Describe challenges...' } },
      { id: 'q6', type: 'long_text', title: 'Goals for next period', required: true, properties: { placeholder: 'Your goals...' } },
      { id: 'q7', type: 'scale', title: 'Rate your overall performance', required: true, properties: { min: 1, max: 10 } },
      { id: 'thank-you', type: 'thank_you', title: 'Review Submitted', description: 'Your manager will review this.', required: false, properties: {} }
    ]
  },
  // Template 36: Brand Awareness Survey
  {
    id: 'brand-awareness',
    name: 'Brand Awareness Survey',
    description: 'Measure brand recognition and perception',
    category: 'survey',
    icon: 'ChartBar',
    color: 'bg-purple-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Brand Survey', description: 'Share your thoughts about our brand', required: false, properties: { buttonText: 'Start' } },
      { id: 'q1', type: 'multiple_choice', title: 'How did you first hear about us?', required: true, properties: { options: [{ id: 'o1', label: 'Social Media', value: 'social' }, { id: 'o2', label: 'Search Engine', value: 'search' }, { id: 'o3', label: 'Friend/Family', value: 'referral' }, { id: 'o4', label: 'Advertisement', value: 'ad' }] } },
      { id: 'q2', type: 'checkbox', title: 'Which words describe our brand?', required: true, properties: { options: [{ id: 'o1', label: 'Innovative', value: 'innovative' }, { id: 'o2', label: 'Trustworthy', value: 'trustworthy' }, { id: 'o3', label: 'Professional', value: 'professional' }, { id: 'o4', label: 'Friendly', value: 'friendly' }] } },
      { id: 'q3', type: 'scale', title: 'How familiar are you with our products?', required: true, properties: { min: 1, max: 10 } },
      { id: 'q4', type: 'yes_no', title: 'Have you purchased from us before?', required: true, properties: {} },
      { id: 'q5', type: 'scale', title: 'How likely are you to recommend us?', required: true, properties: { min: 0, max: 10 } },
      { id: 'q6', type: 'long_text', title: 'Any other feedback?', required: false, properties: { placeholder: 'Your thoughts...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Survey Complete', description: 'Thank you for your feedback!', required: false, properties: {} }
    ]
  },
  // Template 37: Demo Request
  {
    id: 'demo-request',
    name: 'Software Demo Request',
    description: 'Capture demo requests for your software',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-indigo-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Request a Demo', description: 'See our software in action', required: false, properties: { buttonText: 'Book Demo' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Work Email', required: true, properties: { placeholder: 'you@company.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'short_text', title: 'Company Name', required: true, properties: { placeholder: 'Your company' } },
      { id: 'q5', type: 'short_text', title: 'Job Title', required: true, properties: { placeholder: 'Your role' } },
      { id: 'q6', type: 'dropdown', title: 'Company Size', required: true, properties: { options: [{ id: 'o1', label: '1-10', value: '1-10' }, { id: 'o2', label: '11-50', value: '11-50' }, { id: 'o3', label: '51-200', value: '51-200' }, { id: 'o4', label: '200+', value: '200+' }] } },
      { id: 'q7', type: 'multiple_choice', title: 'When are you looking to implement?', required: true, properties: { options: [{ id: 'o1', label: 'Immediately', value: 'now' }, { id: 'o2', label: '1-3 months', value: '1-3' }, { id: 'o3', label: '3-6 months', value: '3-6' }, { id: 'o4', label: 'Just exploring', value: 'exploring' }] } },
      { id: 'thank-you', type: 'thank_you', title: 'Demo Requested!', description: 'Our team will reach out to schedule.', required: false, properties: {} }
    ]
  },
  // Template 38: Pet Adoption
  {
    id: 'pet-adoption',
    name: 'Pet Adoption Application',
    description: 'Screen potential pet adopters',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-orange-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Pet Adoption Application', description: 'Find your perfect companion', required: false, properties: { buttonText: 'Apply' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'dropdown', title: 'Housing Type', required: true, properties: { options: [{ id: 'o1', label: 'House with yard', value: 'house-yard' }, { id: 'o2', label: 'House without yard', value: 'house' }, { id: 'o3', label: 'Apartment', value: 'apartment' }, { id: 'o4', label: 'Condo', value: 'condo' }] } },
      { id: 'q5', type: 'yes_no', title: 'Do you own your home?', required: true, properties: {} },
      { id: 'q6', type: 'yes_no', title: 'Do you have other pets?', required: true, properties: {} },
      { id: 'q7', type: 'long_text', title: 'Experience with pets', required: false, properties: { placeholder: 'Tell us about your experience...' } },
      { id: 'q8', type: 'long_text', title: 'Why do you want to adopt?', required: true, properties: { placeholder: 'Your reasons...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Application Submitted', description: "We'll review and contact you.", required: false, properties: {} }
    ]
  },
  // Template 39: Team Feedback 360
  {
    id: 'team-feedback-360',
    name: 'Team Feedback 360',
    description: 'Collect 360-degree team feedback',
    category: 'hr',
    icon: 'Briefcase',
    color: 'bg-sky-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: '360 Feedback', description: 'Provide feedback for your colleague', required: false, properties: { buttonText: 'Start' } },
      { id: 'q1', type: 'short_text', title: 'Person being reviewed', required: true, properties: { placeholder: 'Colleague name' } },
      { id: 'q2', type: 'dropdown', title: 'Your relationship', required: true, properties: { options: [{ id: 'o1', label: 'Manager', value: 'manager' }, { id: 'o2', label: 'Peer', value: 'peer' }, { id: 'o3', label: 'Direct Report', value: 'report' }, { id: 'o4', label: 'Cross-functional', value: 'cross' }] } },
      { id: 'q3', type: 'rating', title: 'Communication skills', required: true, properties: { max: 5 } },
      { id: 'q4', type: 'rating', title: 'Collaboration', required: true, properties: { max: 5 } },
      { id: 'q5', type: 'rating', title: 'Problem-solving', required: true, properties: { max: 5 } },
      { id: 'q6', type: 'rating', title: 'Leadership', required: true, properties: { max: 5 } },
      { id: 'q7', type: 'long_text', title: 'Key strengths', required: true, properties: { placeholder: 'What they do well...' } },
      { id: 'q8', type: 'long_text', title: 'Areas for improvement', required: true, properties: { placeholder: 'Where they can grow...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Feedback Submitted', description: 'Thank you for your input.', required: false, properties: {} }
    ]
  },
  // Template 40: Real Estate Inquiry
  {
    id: 'real-estate-inquiry',
    name: 'Real Estate Inquiry',
    description: 'Capture leads from property seekers',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-amber-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Property Inquiry', description: 'Tell us what you are looking for', required: false, properties: { buttonText: 'Get Started' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'dropdown', title: 'I am looking to', required: true, properties: { options: [{ id: 'o1', label: 'Buy', value: 'buy' }, { id: 'o2', label: 'Rent', value: 'rent' }, { id: 'o3', label: 'Sell', value: 'sell' }] } },
      { id: 'q5', type: 'dropdown', title: 'Property Type', required: true, properties: { options: [{ id: 'o1', label: 'House', value: 'house' }, { id: 'o2', label: 'Apartment', value: 'apartment' }, { id: 'o3', label: 'Condo', value: 'condo' }, { id: 'o4', label: 'Commercial', value: 'commercial' }] } },
      { id: 'q6', type: 'dropdown', title: 'Budget Range', required: true, properties: { options: [{ id: 'o1', label: 'Under $200K', value: 'under200' }, { id: 'o2', label: '$200K - $500K', value: '200-500' }, { id: 'o3', label: '$500K - $1M', value: '500-1m' }, { id: 'o4', label: '$1M+', value: '1m+' }] } },
      { id: 'q7', type: 'short_text', title: 'Preferred Location', required: true, properties: { placeholder: 'City, neighborhood...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Inquiry Received', description: 'An agent will contact you soon.', required: false, properties: {} }
    ]
  },
  // Template 41: Contest Entry
  {
    id: 'contest-entry',
    name: 'Contest Entry',
    description: 'Accept entries for contests and giveaways',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-pink-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Enter to Win!', description: 'Submit your entry for a chance to win', required: false, properties: { buttonText: 'Enter Now' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: false, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'date', title: 'Date of Birth', required: true, properties: {} },
      { id: 'q5', type: 'yes_no', title: 'I agree to the contest rules', required: true, properties: {} },
      { id: 'q6', type: 'yes_no', title: 'Subscribe to our newsletter?', required: false, properties: {} },
      { id: 'thank-you', type: 'thank_you', title: 'Entry Submitted!', description: 'Good luck! Winners announced soon.', required: false, properties: {} }
    ]
  },
  // Template 42: Course Feedback
  {
    id: 'course-feedback',
    name: 'Course Feedback',
    description: 'Collect feedback on online courses',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-blue-700',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Course Feedback', description: 'Help us improve our courses', required: false, properties: { buttonText: 'Give Feedback' } },
      { id: 'q1', type: 'short_text', title: 'Course Name', required: true, properties: { placeholder: 'Name of the course' } },
      { id: 'q2', type: 'rating', title: 'Overall course quality', required: true, properties: { max: 5 } },
      { id: 'q3', type: 'rating', title: 'Instructor effectiveness', required: true, properties: { max: 5 } },
      { id: 'q4', type: 'rating', title: 'Course materials', required: true, properties: { max: 5 } },
      { id: 'q5', type: 'rating', title: 'Pace of learning', required: true, properties: { max: 5 } },
      { id: 'q6', type: 'yes_no', title: 'Would you recommend this course?', required: true, properties: {} },
      { id: 'q7', type: 'long_text', title: 'What was most valuable?', required: false, properties: { placeholder: 'Best parts of the course...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thank You!', description: 'Your feedback is valuable.', required: false, properties: {} }
    ]
  },
  // Template 43: Sponsorship Request
  {
    id: 'sponsorship-request',
    name: 'Sponsorship Request',
    description: 'Accept sponsorship applications',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-yellow-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Sponsorship Request', description: 'Apply for sponsorship', required: false, properties: { buttonText: 'Apply' } },
      { id: 'q1', type: 'short_text', title: 'Organization Name', required: true, properties: { placeholder: 'Your organization' } },
      { id: 'q2', type: 'short_text', title: 'Contact Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q3', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q4', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q5', type: 'dropdown', title: 'Event/Project Type', required: true, properties: { options: [{ id: 'o1', label: 'Sports Event', value: 'sports' }, { id: 'o2', label: 'Charity Event', value: 'charity' }, { id: 'o3', label: 'Community Project', value: 'community' }, { id: 'o4', label: 'Educational Program', value: 'education' }] } },
      { id: 'q6', type: 'number', title: 'Requested Amount ($)', required: true, properties: { min: 100 } },
      { id: 'q7', type: 'long_text', title: 'Describe your event/project', required: true, properties: { placeholder: 'Tell us about it...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Request Submitted', description: "We'll review your application.", required: false, properties: {} }
    ]
  },
  // Template 44: Membership Application
  {
    id: 'membership-application',
    name: 'Membership Application',
    description: 'Accept new membership applications',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-indigo-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Join Our Community', description: 'Apply for membership today', required: false, properties: { buttonText: 'Apply' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'dropdown', title: 'Membership Type', required: true, properties: { options: [{ id: 'o1', label: 'Basic - $29/month', value: 'basic' }, { id: 'o2', label: 'Premium - $49/month', value: 'premium' }, { id: 'o3', label: 'VIP - $99/month', value: 'vip' }] } },
      { id: 'q5', type: 'long_text', title: 'Why do you want to join?', required: false, properties: { placeholder: 'Tell us about yourself...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Application Submitted', description: "We'll review your application soon.", required: false, properties: {} }
    ]
  },
  // Template 45: Healthcare Intake
  {
    id: 'healthcare-intake',
    name: 'Healthcare Intake',
    description: 'New patient intake form',
    category: 'registration',
    icon: 'Ticket',
    color: 'bg-teal-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Patient Intake Form', description: 'Please provide your information', required: false, properties: { buttonText: 'Begin' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'date', title: 'Date of Birth', required: true, properties: {} },
      { id: 'q3', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q4', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q5', type: 'short_text', title: 'Emergency Contact Name', required: true, properties: { placeholder: 'Contact name' } },
      { id: 'q6', type: 'phone', title: 'Emergency Contact Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q7', type: 'long_text', title: 'Current medications', required: false, properties: { placeholder: 'List any medications...' } },
      { id: 'q8', type: 'long_text', title: 'Allergies', required: false, properties: { placeholder: 'List any allergies...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Form Submitted', description: 'Thank you for completing the intake form.', required: false, properties: {} }
    ]
  },
  // Template 46: Music Preference Survey
  {
    id: 'music-survey',
    name: 'Music Preference Survey',
    description: 'Survey about music preferences',
    category: 'survey',
    icon: 'ChartBar',
    color: 'bg-rose-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Music Survey', description: 'Tell us about your music taste', required: false, properties: { buttonText: 'Start' } },
      { id: 'q1', type: 'checkbox', title: 'Favorite genres', required: true, properties: { options: [{ id: 'o1', label: 'Pop', value: 'pop' }, { id: 'o2', label: 'Rock', value: 'rock' }, { id: 'o3', label: 'Hip-Hop', value: 'hiphop' }, { id: 'o4', label: 'Electronic', value: 'electronic' }, { id: 'o5', label: 'Classical', value: 'classical' }] } },
      { id: 'q2', type: 'multiple_choice', title: 'How do you usually listen to music?', required: true, properties: { options: [{ id: 'o1', label: 'Streaming (Spotify, Apple Music)', value: 'streaming' }, { id: 'o2', label: 'Radio', value: 'radio' }, { id: 'o3', label: 'Vinyl/CDs', value: 'physical' }, { id: 'o4', label: 'YouTube', value: 'youtube' }] } },
      { id: 'q3', type: 'scale', title: 'How important is music in your daily life?', required: true, properties: { min: 1, max: 10 } },
      { id: 'q4', type: 'multiple_choice', title: 'How often do you attend live concerts?', required: true, properties: { options: [{ id: 'o1', label: 'Weekly', value: 'weekly' }, { id: 'o2', label: 'Monthly', value: 'monthly' }, { id: 'o3', label: 'A few times a year', value: 'yearly' }, { id: 'o4', label: 'Rarely/Never', value: 'rarely' }] } },
      { id: 'q5', type: 'short_text', title: 'Favorite artist/band?', required: false, properties: { placeholder: 'Your favorite...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thanks!', description: 'Rock on!', required: false, properties: {} }
    ]
  },
  // Template 47: Freelancer Intake
  {
    id: 'freelancer-intake',
    name: 'Freelancer Intake',
    description: 'Onboard new freelance clients',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-cyan-700',
    questions: [
      { id: 'welcome', type: 'welcome', title: "Let's Work Together", description: 'Tell me about your project', required: false, properties: { buttonText: 'Get Started' } },
      { id: 'q1', type: 'short_text', title: 'Your Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'short_text', title: 'Company/Organization', required: false, properties: { placeholder: 'If applicable' } },
      { id: 'q4', type: 'url', title: 'Website', required: false, properties: { placeholder: 'https://...' } },
      { id: 'q5', type: 'dropdown', title: 'Project Type', required: true, properties: { options: [{ id: 'o1', label: 'Website Design', value: 'web' }, { id: 'o2', label: 'Branding', value: 'branding' }, { id: 'o3', label: 'App Development', value: 'app' }, { id: 'o4', label: 'Marketing', value: 'marketing' }] } },
      { id: 'q6', type: 'dropdown', title: 'Budget', required: true, properties: { options: [{ id: 'o1', label: 'Under $1,000', value: 'under1k' }, { id: 'o2', label: '$1,000 - $5,000', value: '1k-5k' }, { id: 'o3', label: '$5,000 - $10,000', value: '5k-10k' }, { id: 'o4', label: '$10,000+', value: '10k+' }] } },
      { id: 'q7', type: 'dropdown', title: 'Timeline', required: true, properties: { options: [{ id: 'o1', label: 'ASAP', value: 'asap' }, { id: 'o2', label: '1-2 weeks', value: '1-2weeks' }, { id: 'o3', label: '1 month', value: '1month' }, { id: 'o4', label: 'Flexible', value: 'flexible' }] } },
      { id: 'q8', type: 'long_text', title: 'Project Details', required: true, properties: { placeholder: 'Tell me about your project...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Request Received!', description: "I'll review and get back to you within 48 hours.", required: false, properties: {} }
    ]
  },
  // Template 48: Rental Application
  {
    id: 'rental-application',
    name: 'Rental Application',
    description: 'Screen potential tenants',
    category: 'lead',
    icon: 'Envelope',
    color: 'bg-slate-700',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Rental Application', description: 'Apply for this property', required: false, properties: { buttonText: 'Apply' } },
      { id: 'q1', type: 'short_text', title: 'Full Name', required: true, properties: { placeholder: 'Your name' } },
      { id: 'q2', type: 'email', title: 'Email', required: true, properties: { placeholder: 'your@email.com' } },
      { id: 'q3', type: 'phone', title: 'Phone', required: true, properties: { placeholder: '+1 (555) 123-4567' } },
      { id: 'q4', type: 'date', title: 'Desired Move-in Date', required: true, properties: {} },
      { id: 'q5', type: 'short_text', title: 'Current Employer', required: true, properties: { placeholder: 'Your employer' } },
      { id: 'q6', type: 'number', title: 'Monthly Income ($)', required: true, properties: { min: 0 } },
      { id: 'q7', type: 'number', title: 'Number of Occupants', required: true, properties: { min: 1, max: 10 } },
      { id: 'q8', type: 'yes_no', title: 'Do you have pets?', required: true, properties: {} },
      { id: 'thank-you', type: 'thank_you', title: 'Application Received', description: "We'll process your application.", required: false, properties: {} }
    ]
  },
  // Template 49: Feature Request
  {
    id: 'feature-request',
    name: 'Feature Request',
    description: 'Collect feature ideas from users',
    category: 'feedback',
    icon: 'ChatCircle',
    color: 'bg-lime-500',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Request a Feature', description: 'We love hearing your ideas!', required: false, properties: { buttonText: 'Submit Idea' } },
      { id: 'q1', type: 'short_text', title: 'Feature Title', required: true, properties: { placeholder: 'Name your feature idea' } },
      { id: 'q2', type: 'long_text', title: 'Describe the feature', required: true, properties: { placeholder: 'What would this feature do?' } },
      { id: 'q3', type: 'long_text', title: 'What problem does it solve?', required: true, properties: { placeholder: 'How would this help you?' } },
      { id: 'q4', type: 'scale', title: 'How important is this feature to you?', required: true, properties: { min: 1, max: 10 } },
      { id: 'q5', type: 'email', title: 'Your Email', required: false, properties: { placeholder: 'your@email.com' } },
      { id: 'thank-you', type: 'thank_you', title: 'Idea Received!', description: "We'll review your suggestion.", required: false, properties: {} }
    ]
  },
  // Template 50: Pulse Survey
  {
    id: 'pulse-survey',
    name: 'Pulse Survey',
    description: 'Quick employee engagement check',
    category: 'hr',
    icon: 'Briefcase',
    color: 'bg-red-600',
    questions: [
      { id: 'welcome', type: 'welcome', title: 'Weekly Pulse Check', description: 'Quick feedback on how things are going', required: false, properties: { buttonText: 'Start' } },
      { id: 'q1', type: 'scale', title: 'How are you feeling about work this week?', required: true, properties: { min: 1, max: 10 } },
      { id: 'q2', type: 'rating', title: 'Rate your workload balance', required: true, properties: { max: 5 } },
      { id: 'q3', type: 'yes_no', title: 'Do you feel supported by your team?', required: true, properties: {} },
      { id: 'q4', type: 'yes_no', title: 'Any blockers this week?', required: true, properties: {} },
      { id: 'q5', type: 'long_text', title: 'Anything you want to share?', required: false, properties: { placeholder: 'Optional comments...' } },
      { id: 'thank-you', type: 'thank_you', title: 'Thanks!', description: 'Your feedback helps us improve.', required: false, properties: {} }
    ]
  }
]

export type TemplateIconName = 'SquaresFour' | 'ChatCircle' | 'ChartBar' | 'Envelope' | 'Ticket' | 'ShoppingCart' | 'Brain' | 'Briefcase'

export const templateCategories: { id: string; name: string; icon: TemplateIconName }[] = [
  { id: 'all', name: 'All Templates', icon: 'SquaresFour' },
  { id: 'feedback', name: 'Feedback', icon: 'ChatCircle' },
  { id: 'survey', name: 'Survey', icon: 'ChartBar' },
  { id: 'lead', name: 'Lead Generation', icon: 'Envelope' },
  { id: 'registration', name: 'Registration', icon: 'Ticket' },
  { id: 'order', name: 'Orders', icon: 'ShoppingCart' },
  { id: 'quiz', name: 'Quiz', icon: 'Brain' },
  { id: 'hr', name: 'HR & Recruiting', icon: 'Briefcase' },
]
