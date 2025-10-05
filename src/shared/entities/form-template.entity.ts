// src/shared/entities/form-template.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'form_template' })
export class FormTemplate {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'char', length: 36 })
  owner_id: string;

  @ManyToOne(() => User, (u) => u.templates)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
