import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    // For development, you can use Gmail or other SMTP services
    // For production, use proper SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendGuestAccountEmail(
    email: string,
    fullName: string,
    username: string,
    password: string,
    appointmentDate: Date,
    doctorName: string,
  ) {
    const formattedDate = new Date(appointmentDate).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .info-box {
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
          }
          .credentials {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .credentials strong {
            color: #92400e;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PMed Clinic</h1>
            <p>Thông báo đặt lịch hẹn thành công</p>
          </div>
          <div class="content">
            <p>Xin chào <strong>${fullName}</strong>,</p>
            
            <p>Cảm ơn bạn đã đặt lịch hẹn tại PMed Clinic. Chúng tôi đã tạo tài khoản cho bạn để bạn có thể theo dõi trạng thái lịch hẹn.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">Thông tin lịch hẹn:</h3>
              <p><strong>Bác sĩ:</strong> ${doctorName}</p>
              <p><strong>Thời gian:</strong> ${formattedDate}</p>
            </div>
            
            <div class="credentials">
              <h3 style="margin-top: 0; color: #92400e;">Thông tin đăng nhập:</h3>
              <p><strong>Tên đăng nhập:</strong> ${username}</p>
              <p><strong>Mật khẩu:</strong> ${password}</p>
              <p style="font-size: 12px; color: #92400e; margin-top: 10px;">
                ⚠️ Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu để bảo mật tài khoản.
              </p>
            </div>
            
            <p>Bạn có thể đăng nhập vào hệ thống để:</p>
            <ul>
              <li>Xem thông tin lịch hẹn</li>
              <li>Theo dõi trạng thái lịch hẹn</li>
              <li>Xem lịch sử khám bệnh</li>
              <li>Quản lý thông tin cá nhân</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/patient/login" class="button">
                Đăng nhập ngay
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại.
            </p>
          </div>
          <div class="footer">
            <p>PMed Clinic - Chăm sóc sức khỏe của bạn</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"PMed Clinic" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Thông tin tài khoản - Đặt lịch hẹn thành công',
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw error;
    }
  }
}


