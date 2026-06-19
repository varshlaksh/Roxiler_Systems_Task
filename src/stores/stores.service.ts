
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  private readonly SORTABLE_COLUMNS = ['name', 'email', 'address', 'createdAt'];

  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto) {
    const existing = await this.storeRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A store with this email already exists');

    const store = this.storeRepo.create(dto);
    return this.storeRepo.save(store);
  }

  async findAll(
    filters: { name?: string; address?: string },
    sortBy = 'createdAt',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const safeColumn = this.SORTABLE_COLUMNS.includes(sortBy) ? sortBy : 'createdAt';
    const qb = this.storeRepo.createQueryBuilder('s');

    if (filters.name)    qb.andWhere('s.name ILIKE :name', { name: `%${filters.name}%` });
    if (filters.address) qb.andWhere('s.address ILIKE :address', { address: `%${filters.address}%` });

    qb.orderBy(`s.${safeColumn}`, order);
    return qb.getMany();
  }

  async findOneById(storeId: string) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }
}
