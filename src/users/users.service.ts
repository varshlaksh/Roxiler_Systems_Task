import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // only these columns allowed in ORDER BY — blocks sql injection
  private readonly SORTABLE_COLUMNS = ['fullName', 'email', 'address', 'role', 'createdAt'];

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async signup(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepo.create({ ...dto, passwordHash, role: UserRole.USER });
    const saved = await this.userRepo.save(newUser);

    const { passwordHash: _, ...safeUser } = saved;
    return safeUser;
  }

  async createByAdmin(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepo.create({ ...dto, passwordHash });
    const saved = await this.userRepo.save(newUser);

    const { passwordHash: _, ...safeUser } = saved;
    return safeUser;
  }

  async findAll(filters: {
    name?: string;
    email?: string;
    address?: string;
    role?: string;
  }, sortBy = 'createdAt', order: 'ASC' | 'DESC' = 'ASC') {
    const safeColumn = this.SORTABLE_COLUMNS.includes(sortBy) ? sortBy : 'createdAt';
    const qb = this.userRepo.createQueryBuilder('u');

    if (filters.name)    qb.andWhere('u.fullName ILIKE :name', { name: `%${filters.name}%` });
    if (filters.email)   qb.andWhere('u.email ILIKE :email', { email: `%${filters.email}%` });
    if (filters.address) qb.andWhere('u.address ILIKE :address', { address: `%${filters.address}%` });
    if (filters.role)    qb.andWhere('u.role = :role', { role: filters.role });

    qb.orderBy(`u.${safeColumn}`, order);
    qb.select([
      'u.id', 'u.fullName', 'u.email',
      'u.address', 'u.role', 'u.createdAt',
    ]); // never return passwordHash in list

    return qb.getMany();
  }

  async findOneById(userId: string) {
    const account = await this.userRepo.findOne({ where: { id: userId } });
    if (!account) throw new NotFoundException('User not found');
    const { passwordHash: _, ...safeUser } = account;
    return safeUser;
  }

  async changePassword(userId: string, dto: UpdatePasswordDto) {
    const account = await this.userRepo.findOne({ where: { id: userId } });
    if (!account) throw new NotFoundException('User not found');

    const isCorrect = await bcrypt.compare(dto.currentPassword, account.passwordHash);
    if (!isCorrect) throw new BadRequestException('Current password is incorrect');

    account.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(account);
    return { message: 'Password updated successfully' };
  }
}