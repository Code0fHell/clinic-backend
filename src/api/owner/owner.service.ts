import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Bill } from '../../shared/entities/bill.entity';
import { Payment } from '../../shared/entities/payment.entity';
import { Visit } from '../../shared/entities/visit.entity';
import { BillType } from '../../shared/enums/bill-type.enum';
import { PaymentStatus } from '../../shared/enums/payment-status.enum';
import { Timeframe } from './dto/dashboard-revenue-query.dto';
import { WorkSchedule } from 'src/shared/entities/work-schedule.entity';
import { WorkScheduleDetail } from 'src/shared/entities/work-schedule-detail.entity';
import { Staff } from 'src/shared/entities/staff.entity';
import { User } from 'src/shared/entities/user.entity';
import { QueryWeeklyScheduleOwnerDto } from './dto/query-owner-schedule.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

// 2 interface dữ liệu trả về
export interface RevenueDataPoint {
    label: string; // Nhãn hiển thị(01/12, Tuần 3)
    revenueClinic: number;
    revenueService: number;
    revenuePharma: number;
    visits: number;
}

export interface ServiceBreakdownItem {
    name: string;
    revenue: number;
    visits: number;
}

@Injectable()
export class OwnerService {
    constructor(
        @InjectRepository(Bill)
        private readonly billRepository: Repository<Bill>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Visit)
        private readonly visitRepository: Repository<Visit>,
        @InjectRepository(WorkSchedule)
        private readonly workScheduleRepository: Repository<WorkSchedule>,
        @InjectRepository(WorkScheduleDetail)
        private readonly workScheduleDetailRepository: Repository<WorkScheduleDetail>,
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async getDashboardRevenue(
        startDate: string,
        endDate: string,
        timeframe: Timeframe,
    ): Promise<RevenueDataPoint[]> {

        const start = new Date(`${startDate}T00:00:00+07:00`);
        const end = new Date(`${endDate}T23:59:59.999+07:00`);

        // Bills (SUCCESS)
        const bills = await this.billRepository
            .createQueryBuilder('bill')
            .innerJoin('bill.payments', 'payment')
            .where('bill.created_at BETWEEN :start AND :end', { start, end })
            .andWhere('payment.payment_status = :status', {
                status: PaymentStatus.SUCCESS,
            })
            .distinct(true)
            .getMany();

        // Visits
        const visits = await this.visitRepository.find({
            where: {
                created_at: Between(start, end),
            },
        });

        const map = new Map<string, RevenueDataPoint>();

        // Bills → revenue
        for (const bill of bills) {
            const key = this.getTimeframeKey(bill.created_at, timeframe);

            if (!map.has(key)) {
                map.set(key, {
                    label: this.formatLabel(key, timeframe),
                    revenueClinic: 0,
                    revenueService: 0,
                    revenuePharma: 0,
                    visits: 0,
                });
            }

            const point = map.get(key)!;
            const amount = Number(bill.total);

            if (bill.bill_type === BillType.CLINICAL) point.revenueClinic += amount;
            if (bill.bill_type === BillType.SERVICE) point.revenueService += amount;
            if (bill.bill_type === BillType.MEDICINE) point.revenuePharma += amount;
        }

        // Visits → count
        for (const visit of visits) {
            const key = this.getTimeframeKey(visit.created_at, timeframe);

            if (!map.has(key)) {
                map.set(key, {
                    label: this.formatLabel(key, timeframe),
                    revenueClinic: 0,
                    revenueService: 0,
                    revenuePharma: 0,
                    visits: 0,
                });
            }

            map.get(key)!.visits += 1;
        }

        // Sort theo thời gian thật
        const result = Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, v]) => v);

        // Fill missing DAY
        if (timeframe === Timeframe.DAY) {
            return this.fillMissingDays(start, end, result);
        }

        return result;
    }

    // Lấy dữ liệu cho biểu đồ (bar chart)
    async getServiceBreakdown(): Promise<ServiceBreakdownItem[]> {
        // Get all bills with SUCCESS payments
        const bills = await this.billRepository
            .createQueryBuilder('bill')
            .innerJoin('bill.payments', 'payment')
            .where('payment.payment_status = :status', { status: PaymentStatus.SUCCESS })
            .distinct(true)
            .getMany();

        // Count visits for clinical services
        const clinicalVisits = await this.visitRepository.count();

        // Calculate breakdown
        let khambenhRevenue = 0;
        let canlamsangRevenue = 0;
        let banthuocRevenue = 0;
        let canlamsangVisits = 0;

        for (const bill of bills) {
            const amount = parseFloat(bill.total.toString());

            if (bill.bill_type === BillType.CLINICAL) {
                khambenhRevenue += amount;
            } else if (bill.bill_type === BillType.SERVICE) {
                canlamsangRevenue += amount;
                canlamsangVisits += 1;
            } else if (bill.bill_type === BillType.MEDICINE) {
                banthuocRevenue += amount;
            }
        }

        // Count medicine-related visits (prescriptions)
        const banthuocVisits = await this.billRepository
            .createQueryBuilder('bill')
            .innerJoin('bill.payments', 'payment')
            .where('bill.bill_type = :type', { type: BillType.MEDICINE })
            .andWhere('payment.payment_status = :status', { status: PaymentStatus.SUCCESS })
            .getCount();

        return [
            {
                name: 'Lâm sàng',
                revenue: khambenhRevenue,
                visits: clinicalVisits,
            },
            {
                name: 'Cận lâm sàng',
                revenue: canlamsangRevenue,
                visits: canlamsangVisits,
            },
            {
                name: 'Thuốc',
                revenue: banthuocRevenue,
                visits: banthuocVisits,
            },
        ];
    }

    // Tạo key để nhóm và sắp xếp dữ liệu (theo giờ Việt Nam)
    private getTimeframeKey(date: Date, timeframe: Timeframe): string {
        // Convert date sang giờ Việt Nam (+07:00)
        const vnDate = new Date(
            date.toLocaleString("en-US", {
                timeZone: "Asia/Ho_Chi_Minh",
            })
        );

        switch (timeframe) {
            case Timeframe.DAY:
                // Format theo VN timezone: YYYY-MM-DD
                const year = vnDate.getFullYear();
                const month = String(vnDate.getMonth() + 1).padStart(2, '0');
                const day = String(vnDate.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;

            case Timeframe.WEEK: {
                const week = this.getWeekNumber(vnDate);
                return `${vnDate.getFullYear()}-W${week}`;
            }

            case Timeframe.MONTH:
                return `${vnDate.getFullYear()}-${String(vnDate.getMonth() + 1).padStart(2, '0')}`;

            case Timeframe.QUARTER:
                return `${vnDate.getFullYear()}-Q${Math.floor(vnDate.getMonth() / 3) + 1}`;
        }
    }

    // Chuyển thời gian thành text để cho label của chart
    private formatLabel(key: string, timeframe: Timeframe): string {
        switch (timeframe) {
            case Timeframe.DAY: {
                // key: YYYY-MM-DD
                const [y, m, d] = key.split('-');
                return `${d}/${m}/${y}`;
            }

            case Timeframe.WEEK: {
                // key: YYYY-Wxx
                const [, week] = key.split('-W');
                return `Tuần ${week}`;
            }

            case Timeframe.MONTH: {
                // key: YYYY-MM
                const [y, m] = key.split('-');
                return `T${m}/${y}`;
            }

            case Timeframe.QUARTER: {
                // key: YYYY-Qx
                const [y, q] = key.split('-Q');
                return `Q${q}/${y}`;
            }
        }
    }

    // Tính tuần (theo giờ Việt Nam)
    private getWeekNumber(date: Date): number {
        // date đã được convert sang VN timezone rồi
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayNum = d.getDay() || 7;
        d.setDate(d.getDate() + 4 - dayNum);
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }

    // Bù ngày bị thiếu
    private fillMissingDays(
        start: Date,
        end: Date,
        data: RevenueDataPoint[],
    ): RevenueDataPoint[] {

        const map = new Map<string, RevenueDataPoint>();

        // rebuild key từ label
        data.forEach(d => {
            const [day, month, year] = d.label.split('/');
            const key = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            map.set(key, d);
        });

        const result: RevenueDataPoint[] = [];
        const cur = new Date(start);

        while (cur <= end) {
            // Convert sang VN timezone để lấy key đúng
            const vnCur = new Date(
                cur.toLocaleString("en-US", {
                    timeZone: "Asia/Ho_Chi_Minh",
                })
            );
            const year = vnCur.getFullYear();
            const month = String(vnCur.getMonth() + 1).padStart(2, '0');
            const day = String(vnCur.getDate()).padStart(2, '0');
            const key = `${year}-${month}-${day}`;
            // Format label giống với formatLabel để đảm bảo nhất quán
            const label = `${day}/${month}/${year}`;

            result.push(
                map.get(key) ?? {
                    label,
                    revenueClinic: 0,
                    revenueService: 0,
                    revenuePharma: 0,
                    visits: 0,
                }
            );

            cur.setDate(cur.getDate() + 1);
        }

        return result;
    }

    //Xuất excel cho doanh thu
    async exportRevenueDetailToExcel(
        startDate: string,
        endDate: string,
        timeframe: Timeframe,
        res: Response,
    ) {
        // 1. Lấy dữ liệu doanh thu
        const data = await this.getDashboardRevenue(startDate, endDate, timeframe);
        const exportData = [...data].reverse();

        // 2. Tạo workbook & worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Chi tiết doanh thu');

        // 3. Khai báo cột
        worksheet.columns = [
            { header: 'STT', key: 'index', width: 6 },
            { header: 'Mốc thời gian', key: 'label', width: 18 },
            { header: 'Doanh thu lâm sàng', key: 'revenueClinic', width: 22 },
            { header: 'Doanh thu cận lâm sàng', key: 'revenueService', width: 25 },
            { header: 'Doanh thu bán thuốc', key: 'revenuePharma', width: 22 },
            { header: 'Lượt khám', key: 'visits', width: 14 },
        ];

        // 4. Style header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // 5. Đổ dữ liệu
        exportData.forEach((item, index) => {
            worksheet.addRow({
                index: index + 1,
                label: item.label,
                revenueClinic: item.revenueClinic,
                revenueService: item.revenueService,
                revenuePharma: item.revenuePharma,
                visits: item.visits,
            });
        });

        // 6. Format số tiền
        ['revenueClinic', 'revenueService', 'revenuePharma'].forEach((key) => {
            worksheet.getColumn(key).numFmt = '#,##0';
        });

        worksheet.getColumn('visits').alignment = { horizontal: 'right' };

        // 7. Tổng cộng (footer)
        const totalRow = worksheet.addRow({
            label: 'Tổng cộng',
            revenueClinic: data.reduce((s, i) => s + i.revenueClinic, 0),
            revenueService: data.reduce((s, i) => s + i.revenueService, 0),
            revenuePharma: data.reduce((s, i) => s + i.revenuePharma, 0),
            visits: data.reduce((s, i) => s + i.visits, 0),
        });

        totalRow.font = { bold: true };

        // 8. Xuất file
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=chi_tiet_doanh_thu_${startDate}_${endDate}.xlsx`,
        );

        await workbook.xlsx.write(res);
        res.end();
    }

    // Lấy lịch làm việc của tất cả nhân viên trong 1 tuần
    async getWeeklySchedule(dto: QueryWeeklyScheduleOwnerDto) {
        const { start_date, roleType = 'all', cursor, limit = 10 } = dto;

        // 00:00 ngày đầu tuần (VN)
        const startDate = new Date(`${start_date}T00:00:00+07:00`);

        // 23:59:59 ngày cuối tuần (VN)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        const userQB = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.staff', 'staff') // chỉ doctor mới có
            .where('user.user_role IN (:...roles)', {
                roles: ['DOCTOR', 'PHARMACIST', 'RECEPTIONIST'],
            })
            .orderBy('user.id', 'ASC')
            .take(limit);

        if (cursor) {
            userQB.andWhere('user.id > :cursor', { cursor });
        }

        if (roleType !== 'all') {
            userQB.andWhere('user.user_role = :roleType', { roleType });
        }

        const users = await userQB.getMany();
        if (users.length === 0) {
            return { data: [], nextCursor: null };
        }

        //  Lấy schedule cho doctor
        const doctorStaffIds = users
            .filter(u => u.user_role === 'DOCTOR' && u.staff?.id)
            .map(u => u.staff!.id);

        let scheduleMap = new Map<string, Map<string, any>>();

        if (doctorStaffIds.length) {
            const schedules = await this.workScheduleRepository
                .createQueryBuilder('ws')
                .leftJoinAndSelect('ws.details', 'details')
                .leftJoinAndSelect('ws.staff', 'staff')
                .where('staff.id IN (:...ids)', { ids: doctorStaffIds })
                .andWhere('ws.work_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate,
                })
                .getMany();

            schedules.forEach(ws => {
                if (!ws.staff?.id) return;

                const staffId = ws.staff.id;
                const dateKey = new Date(ws.work_date)
                    .toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
                    .slice(0, 10);

                if (!scheduleMap.has(staffId)) {
                    scheduleMap.set(staffId, new Map());
                }

                scheduleMap.get(staffId)!.set(dateKey, {
                    work_schedule_id: ws.id,
                    total_slots: ws.details?.length || 0,
                    booked_slots: ws.details?.filter(d => d.is_booked).length || 0,
                });
            });
        }

        const data = users.map(user => {
            const daily: Record<string, any> = {};

            for (let i = 0; i < 7; i++) {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i);
                const key = d.toLocaleDateString(
                    'en-CA',
                    { timeZone: 'Asia/Ho_Chi_Minh' }
                );

                if (user.user_role === 'DOCTOR' && user.staff?.id) {
                    const daySchedule = scheduleMap
                        .get(user.staff.id)
                        ?.get(key);

                    daily[key] = daySchedule
                        ? {
                            status: 'WORKING',
                            work_schedule_id: daySchedule.work_schedule_id,
                            total_slots: daySchedule.total_slots,
                            booked_slots: daySchedule.booked_slots,
                        }
                        : { status: 'OFF' };
                } else {
                    // lễ tân / dược sĩ: chỉ có trạng thái
                    daily[key] = { status: 'WORKING' };
                }

            }

            return {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    role: user.user_role,
                },
                staff: user.staff
                    ? {
                        id: user.staff.id,
                        department: user.staff.department,
                        doctor_type: user.staff.doctor_type,
                        is_available: user.staff.is_available
                    }
                    : null,
                schedule: daily,
            };
        });

        return {
            data,
            nextCursor: users[users.length - 1].id,
        };
    }

    // Lấy chi tiết lịch làm việc của bác sĩ trong 1 ngày
    async getDoctorDailySchedule(workScheduleId: string) {
        const workSchedule = await this.workScheduleRepository.findOne({
            where: { id: workScheduleId },
            relations: {
                staff: {
                    user: true,
                },
                details: true,
            },
            order: {
                details: {
                    slot_start: 'ASC',
                },
            },
        });

        if (!workSchedule) {
            throw new NotFoundException('Work schedule not found');
        }

        const staff = workSchedule.staff;

        return {
            staff: {
                id: staff.id,
                full_name: staff.user.full_name,
                department: staff.department,
                position: staff.position,
                doctor_type: staff.doctor_type,
            },
            schedule: {
                id: workSchedule.id,
                work_date: workSchedule.work_date,
                start_time: workSchedule.start_time,
                end_time: workSchedule.end_time,
                slots: workSchedule.details.map(detail => ({
                    id: detail.id,
                    slot_start: detail.slot_start,
                    slot_end: detail.slot_end,
                    is_booked: detail.is_booked,
                })),
            },
        };
    }


}
