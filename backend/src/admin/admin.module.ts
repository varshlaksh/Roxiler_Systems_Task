
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Store } from '../stores/store.entity';
import { Rating } from '../ratings/rating.entity';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Store, Rating])],
  controllers: [AdminController],
})
export class AdminModule {}
