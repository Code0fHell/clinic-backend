// src/shared/entities/medicine.entity.ts
import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'medicine' })
export class Medicine {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  unit?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ length: 255, nullable: true })
  manufacturer?: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
