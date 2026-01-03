# Email Configuration Guide

## Cài đặt Nodemailer

Để sử dụng tính năng gửi email, bạn cần cài đặt nodemailer:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

## Gmail Setup

Nếu sử dụng Gmail:

1. Bật 2-Step Verification cho tài khoản Gmail
2. Tạo App Password:
   - Vào Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Tạo app password mới cho "Mail"
   - Sử dụng password này cho `SMTP_PASS`

## Các SMTP Provider khác

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Testing

Để test email service, bạn có thể sử dụng các service như:
- Mailtrap (development)
- Ethereal Email (testing)
- Gmail SMTP (production)

## Lưu ý

- Trong production, nên sử dụng service chuyên nghiệp như SendGrid, Mailgun, hoặc AWS SES
- Không commit thông tin SMTP vào git
- Sử dụng environment variables cho tất cả cấu hình nhạy cảm


