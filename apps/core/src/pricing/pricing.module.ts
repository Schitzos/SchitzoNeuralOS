import { Module } from '@nestjs/common';
import { ModelPricingService } from './model-pricing.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ModelPricingService, PrismaService],
  exports: [ModelPricingService],
})
export class PricingModule {}