import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/shared/entities/patient.entity';

@Injectable()
export class LoadPatientInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.userId) {
      const patient = await this.patientRepo.findOne({
        where: { user: { id: user.userId } },
        relations: ['user'],
      });

      request.user = {
        ...user,
        patient,
      };
    }

    return next.handle();
  }
}
