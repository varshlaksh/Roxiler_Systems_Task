
import {
  Body, Controller, Get, Param,
  Post, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('stores')
@UseGuards(AuthGuard('jwt'))
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // Admin only — add a new store
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  // All logged in users — filterable + sortable store list
  @Get()
  findAll(
    @Query('name') name?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    return this.storesService.findAll({ name, address }, sortBy, order);
  }

  // All logged in users — single store detail
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOneById(id);
  }
}
