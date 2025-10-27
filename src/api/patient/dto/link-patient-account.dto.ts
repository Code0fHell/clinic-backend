import { ApiProperty } from '@nestjs/swagger';

export class LinkPatientAccountDto {
    @ApiProperty({ description: 'ID của user vừa đăng ký tài khoản' })
    userId: string;

    @ApiProperty({ description: 'Số điện thoại mà bệnh nhân đã khai báo tại bệnh viện' })
    phone: string;
}
