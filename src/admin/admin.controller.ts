
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Store } from '../stores/store.entity';
import { Rating } from '../ratings/rating.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { mkdir } from 'fs/promises';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    @InjectRepository(User)  private readonly userRepo: Repository<User>,
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
  ) {}

  @Get('stats')
  async getDashboardStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.userRepo.count(),
      this.storeRepo.count(),
      this.ratingRepo.count(),
    ]);

    return { totalUsers, totalStores, totalRatings };
  }
}
