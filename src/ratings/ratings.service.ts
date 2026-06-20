
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
  ) {}

  async submitRating(userId: string, storeId: string, value: number) {
    if (value < 1 || value > 5) {
      throw new BadRequestException('Rating value must be between 1 and 5');
    }

    // Edge case: user already rated this store
    const alreadyRated = await this.ratingRepo.findOne({
      where: {
        submittedBy: { id: userId },
        store: { id: storeId },
      },
    });

    if (alreadyRated) {
      throw new ConflictException(
        'You have already rated this store. Use PATCH /ratings/:id to update it.',
      );
    }

    const entry = this.ratingRepo.create({
      value,
      submittedBy: { id: userId },
      store: { id: storeId },
    });

    return this.ratingRepo.save(entry);
  }

  async updateRating(ratingId: string, userId: string, value: number) {
    if (value < 1 || value > 5) {
      throw new BadRequestException('Rating value must be between 1 and 5');
    }

    const existing = await this.ratingRepo.findOne({
  where: { id: ratingId },
  relations: { submittedBy: true },
});

    if (!existing) throw new NotFoundException('Rating not found');

    // User can only update their own rating
    if (existing.submittedBy.id !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    existing.value = value;
    return this.ratingRepo.save(existing);
  }

  async getStoreAverageRating(storeId: string) {
    const result = await this.ratingRepo
      .createQueryBuilder('r')
      .select('AVG(r.value)', 'avg')
      .addSelect('COUNT(r.id)', 'total')
      .where('r.store_id = :storeId', { storeId })
      .getRawOne();

    // Edge case: no ratings yet — never return NaN
    if (!result || result.total === '0') {
      return { averageRating: null, totalRatings: 0 };
    }

    return {
      averageRating: parseFloat(parseFloat(result.avg).toFixed(1)),
      totalRatings: parseInt(result.total),
    };
  }

  async getUserRatingForStore(userId: string, storeId: string) {
    const rating = await this.ratingRepo.findOne({
      where: {
        submittedBy: { id: userId },
        store: { id: storeId },
      },
    });
    return rating ?? null; // null means user hasn't rated this store yet
  }

  async getStoreRatersList(storeId: string) {
    return this.ratingRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.submittedBy', 'u')
      .where('r.store_id = :storeId', { storeId })
      .select([
        'r.id',
        'r.value',
        'r.createdAt',
        'u.id',
        'u.fullName',
        'u.email',
      ])
      .orderBy('r.createdAt', 'DESC')
      .getMany();
  }
}