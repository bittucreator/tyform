# Supabase Auth Email Templates

These HTML templates are designed for Supabase Authentication emails. Copy the content of each file into your Supabase dashboard.

## How to Use

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select the template type (e.g., "Confirm signup")
3. Copy the HTML content from the corresponding file
4. Paste it into the "Message body" field
5. Save changes

## Template Files

| File | Supabase Template | Description |
|------|-------------------|-------------|
| `confirm-signup.html` | Confirm sign up | Sent when users sign up to verify email |
| `invite-user.html` | Invite user | Sent when inviting new users via Supabase |
| `magic-link.html` | Magic link | Sent for passwordless sign-in |
| `change-email.html` | Change email address | Sent to verify new email address |
| `reset-password.html` | Reset password | Sent when users request password reset |
| `reauthentication.html` | Reauthentication | Sent for sensitive action verification |

## Subject Lines

Use these subject lines in Supabase:

- **Confirm sign up**: `Confirm your email - Tyform`
- **Invite user**: `You're invited to join Tyform`
- **Magic link**: `Sign in to Tyform`
- **Change email**: `Confirm your new email - Tyform`
- **Reset password**: `Reset your password - Tyform`
- **Reauthentication**: `Verify your identity - Tyform`

## Template Variables

Supabase provides these variables you can use in templates:

- `{{ .ConfirmationURL }}` - The confirmation/action URL
- `{{ .Token }}` - The OTP token (for OTP flows)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

## SMTP Configuration

Configure UnoSend SMTP in Supabase:

1. Go to **Project Settings** → **Authentication** → **SMTP Settings**
2. Enable "Custom SMTP"
3. Enter:
   - **Host**: `smtp.unosend.co`
   - **Port**: `587`
   - **Username**: Your UnoSend SMTP username
   - **Password**: Your UnoSend SMTP password
   - **Sender email**: `noreply@tyform.app`
   - **Sender name**: `Tyform`

## Customization

The templates use:

- **Primary color**: `#7c3aed` (violet-600)
- **Text colors**: `#18181b` (zinc-900), `#52525b` (zinc-600), `#a1a1aa` (zinc-400)
- **Background**: `#f4f4f5` (zinc-100)
- **Card background**: `#ffffff`
- **Border radius**: `12px` for cards, `8px` for buttons

To change the brand color, replace `#7c3aed` with your preferred color.
