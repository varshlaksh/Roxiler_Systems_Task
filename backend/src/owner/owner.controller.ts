
import {
  Controller, Get, NotFoundException,
  Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../stores/store.entity';
import { RatingsService } from '../ratings/ratings.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('owner')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('store_owner')
export class OwnerController {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    private readonly ratingsService: RatingsService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    // Store owner sees only their own store
    const ownedStore = await this.storeRepo.findOne({
      where: { owner: { id: req.user.id } },
    });

    if (!ownedStore) {
      throw new NotFoundException('No store is linked to your account');
    }

    const [ratersList, ratingStats] = await Promise.all([
      this.ratingsService.getStoreRatersList(ownedStore.id),
      this.ratingsService.getStoreAverageRating(ownedStore.id),
    ]);

    return {
      store: ownedStore,
      averageRating: ratingStats.averageRating,
      totalRatings: ratingStats.totalRatings,
      ratersList,
    };
  }
}
