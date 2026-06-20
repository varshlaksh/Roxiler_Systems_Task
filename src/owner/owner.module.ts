
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../stores/store.entity';
import { OwnerController } from './owner.controller';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), RatingsModule],
  controllers: [OwnerController],
})
export class OwnerModule {}
