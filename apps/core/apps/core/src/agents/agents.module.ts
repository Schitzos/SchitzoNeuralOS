import { Module } from '@nestjs/common';
import { AgentRegistryService } from './agent-registry.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [AgentRegistryService, PrismaService],
  exports: [AgentRegistryService],
})
export class AgentsModule {}