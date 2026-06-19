import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const account = await this.userRepo.findOne({ where: { email } });

    // same message for both — don't leak which field was wrong
    if (!account) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(password, account.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: account.id, role: account.role };
    return {
      accessToken: this.jwtService.sign(payload),
      role: account.role,
    };
  }
}