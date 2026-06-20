
import {
  Body, Controller, Get, Param,
  Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RatingsService } from './ratings.service';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

class SubmitRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;

  @IsUUID()
  storeId: string;
}

class UpdateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;
}

@Controller('ratings')
@UseGuards(AuthGuard('jwt'))
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  // Normal user — submit a rating
  @Post()
  @UseGuards(RolesGuard)
  @Roles('user')
  submit(@Request() req, @Body() dto: SubmitRatingDto) {
    return this.ratingsService.submitRating(req.user.id, dto.storeId, dto.value);
  }

  // Normal user — update their own rating
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('user')
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateRatingDto) {
    return this.ratingsService.updateRating(id, req.user.id, dto.value);
  }

  // Any logged in user — get avg rating for a store
  @Get('store/:storeId')
  getStoreAvg(@Param('storeId') storeId: string) {
    return this.ratingsService.getStoreAverageRating(storeId);
  }

  // Normal user — get their own rating for a specific store
  @Get('store/:storeId/mine')
  @UseGuards(RolesGuard)
  @Roles('user')
  getMyRating(@Param('storeId') storeId: string, @Request() req) {
    return this.ratingsService.getUserRatingForStore(req.user.id, storeId);
  }
}
