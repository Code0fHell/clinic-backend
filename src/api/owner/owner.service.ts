import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Bill } from '../../shared/entities/bill.entity';
import { Payment } from '../../shared/entities/payment.entity';
import { Visit } from '../../shared/entities/visit.entity';
import { BillType } from '../../shared/enums/bill-type.enum';
import { PaymentStatus } from '../../shared/enums/payment-status.enum';
import { Timeframe } from './dto/dashboard-revenue-query.dto';

// 2 interface dữ liệu trả về
export interface RevenueDataPoint {
    label: string; // Nhãn hiển thị(01/12, Tuần 3)
    revenueClinic: number; // Doanh thu (khám + dịch vụ)
    revenuePharma: number; // Doanh thu (thuốc)
    visits: number; // Lượt thăm khám
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
    ) { }

    async getDashboardRevenue(
        startDate: string,
        endDate: string,
        timeframe: Timeframe,
    ): Promise<RevenueDataPoint[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        start.setHours(0, 0, 0, 0);

        // Get all bills in the date range (only SUCCESS payments)
        const bills = await this.billRepository
            .createQueryBuilder('bill')
            .innerJoin('bill.payments', 'payment')
            .where('bill.created_at BETWEEN :start AND :end', { start, end })
            .andWhere('payment.payment_status = :status', { status: PaymentStatus.SUCCESS })
            .distinct(true)
            .getMany();

        // Get all visits in the date range
        const visits = await this.visitRepository.find({
            where: {
                created_at: Between(start, end),
            },
        });

        // Group data by timeframe
        const dataMap = new Map<string, RevenueDataPoint>();

        // Process bills
        for (const bill of bills) {
            const billDate = new Date(bill.created_at);
            const key = this.getTimeframeKey(billDate, timeframe, start);

            if (!dataMap.has(key)) {
                dataMap.set(key, {
                    label: this.formatLabel(key, timeframe, billDate),
                    revenueClinic: 0,
                    revenuePharma: 0,
                    visits: 0,
                });
            }

            const dataPoint = dataMap.get(key);
            if (!dataPoint) continue;

            const billAmount = parseFloat(bill.total.toString());

            if (bill.bill_type === BillType.MEDICINE) {
                dataPoint.revenuePharma += billAmount;
            } else if (bill.bill_type === BillType.CLINICAL || bill.bill_type === BillType.SERVICE) {
                dataPoint.revenueClinic += billAmount;
            }
        }

        // Process visits
        for (const visit of visits) {
            const visitDate = new Date(visit.created_at);
            const key = this.getTimeframeKey(visitDate, timeframe, start);

            if (!dataMap.has(key)) {
                dataMap.set(key, {
                    label: this.formatLabel(key, timeframe, visitDate),
                    revenueClinic: 0,
                    revenuePharma: 0,
                    visits: 0,
                });
            }

            const dataPoint = dataMap.get(key);
            if (dataPoint) {
                dataPoint.visits += 1;
            }
        }

        // convert Map → array, giữ lại key
        const resultWithKey = Array.from(dataMap.entries()).map(([key, value]) => ({
            ...value,
            __key: key, // private sortable key
        }));

        // Sort by key
        resultWithKey.sort((a, b) => {
            return new Date(a.__key).getTime() - new Date(b.__key).getTime();
        });

        // Trước khi return → remove key phụ
        const result = resultWithKey.map(({ __key, ...rest }) => rest);

        // Fill in missing periods if needed (for day/week/month/quarter)
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
                name: 'Dịch vụ',
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

    // Tạo key để nhóm và sắp xếp dữ liệu
    private getTimeframeKey(date: Date, timeframe: Timeframe, startDate: Date): string {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const week = this.getWeekNumber(date);

        switch (timeframe) {
            case Timeframe.DAY:
                return `${year}-${month + 1}-${day}`;
            case Timeframe.WEEK:
                return `${year}-W${week}`;
            case Timeframe.MONTH:
                return `${year}-${month + 1}`;
            case Timeframe.QUARTER:
                const quarter = Math.floor(month / 3) + 1;
                return `${year}-Q${quarter}`;
            default:
                return `${year}-${month + 1}-${day}`;
        }
    }

    // Chuyển thời gian thành text để cho label của chart
    private formatLabel(key: string, timeframe: Timeframe, date: Date): string {
        switch (timeframe) {
            case Timeframe.DAY:
                const dayStr = String(date.getDate()).padStart(2, '0');
                const monthStr = String(date.getMonth() + 1).padStart(2, '0');
                return `${dayStr}/${monthStr}`;
            case Timeframe.WEEK:
                const weekDay = date.getDay();
                const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                return dayNames[weekDay] || 'T2';
            case Timeframe.MONTH:
                const weekNum = this.getWeekNumber(date);
                return `Tuần ${weekNum}`;
            case Timeframe.QUARTER:
                const monthNum = date.getMonth() + 1;
                return `Tháng ${monthNum}`;
            default:
                return key;
        }
    }

    // Tính tuần
    private getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }

    // Bù ngày bị thiếu
    private fillMissingDays(start: Date, end: Date, existingData: RevenueDataPoint[]): RevenueDataPoint[] {
        const result: RevenueDataPoint[] = [];
        const existingMap = new Map<string, RevenueDataPoint>();

        existingData.forEach(item => {
            existingMap.set(item.label, item);
        });

        const current = new Date(start);
        while (current <= end) {
            const day = String(current.getDate()).padStart(2, '0');
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const label = `${day}/${month}`;

            const existingItem = existingMap.get(label);
            if (existingItem) {
                result.push(existingItem);
            } else {
                result.push({
                    label,
                    revenueClinic: 0,
                    revenuePharma: 0,
                    visits: 0,
                });
            }

            current.setDate(current.getDate() + 1);
        }

        return result;
    }
}
