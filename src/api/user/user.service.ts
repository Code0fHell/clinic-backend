import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../shared/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string) {
    return this.userRepository.findOne({ 
      where: { username },
      relations: ["patient", "staff"],
    });
  }

  async getProfile(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ["patient", "staff"],
    });
  }

  async findByUsernameOrEmail(username: string, email: string) {
    return this.userRepository.findOne({ where: [{ username }, { email }] });
  }

  async createUser(data: Partial<User>) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async updateProfile(id: string, dto: Partial<User>) {
    await this.userRepository.update(id, dto);
    return this.findById(id);
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }
}
