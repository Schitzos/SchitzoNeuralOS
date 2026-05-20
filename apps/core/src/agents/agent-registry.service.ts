import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export interface AgentProfile {
  name: string;
  description: string;
  prompt: string;
  tools: string[];
  allowedTools: string[];
  resources?: string[];
  keyboardShortcut?: string;
  welcomeMessage?: string;
}

@Injectable()
export class AgentRegistryService implements OnModuleInit {
  private agents: Map<string, AgentProfile> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadAgentProfiles();
    await this.seedAgentDatabase();
  }

  private async loadAgentProfiles() {
    const agentsDir = path.join(process.cwd(), '.meta', 'agents');
    
    if (!fs.existsSync(agentsDir)) {
      console.warn('⚠️ .meta/agents directory not found, skipping agent profile loading');
      return;
    }

    const files = fs.readdirSync(agentsDir).filter(file => file.endsWith('.json'));
    
    for (const file of files) {
      try {
        const filePath = path.join(agentsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const profile: AgentProfile = JSON.parse(content);
        
        // Validate required fields
        if (!profile.name || !profile.description || !profile.prompt) {
          console.warn(`⚠️ Invalid agent profile in ${file}: missing required fields`);
          continue;
        }

        this.agents.set(profile.name, profile);
        console.log(`✅ Loaded agent profile: @${profile.name}`);
      } catch (error) {
        console.error(`❌ Failed to load agent profile from ${file}:`, (error as Error).message);
      }
    }

    console.log(`📋 Loaded ${this.agents.size} agent profiles from .meta/agents/`);
  }

  private async seedAgentDatabase() {
    for (const [name, profile] of this.agents) {
      try {
        await this.prisma.agent.upsert({
          where: { name },
          update: {
            description: profile.description,
            prompt: profile.prompt,
            allowedTools: profile.allowedTools || profile.tools || [],
            keyboardShortcut: profile.keyboardShortcut,
            welcomeMessage: profile.welcomeMessage,
            status: 'active',
            agentType: this.getAgentType(name),
          },
          create: {
            name,
            description: profile.description,
            prompt: profile.prompt,
            allowedTools: profile.allowedTools || profile.tools || [],
            keyboardShortcut: profile.keyboardShortcut,
            welcomeMessage: profile.welcomeMessage,
            status: 'active',
            agentType: this.getAgentType(name),
            capabilityPolicy: {
              maxConcurrentTasks: this.getMaxConcurrentTasks(name),
              approvalRequired: this.getApprovalRequired(name),
              allowedModelTiers: this.getAllowedModelTiers(name),
            },
          },
        });
      } catch (error) {
        console.error(`❌ Failed to seed agent ${name} to database:`, (error as Error).message);
      }
    }
  }

  private getAgentType(name: string): string {
    // Founding agents (always available)
    if (['PO', 'PM', 'AL'].includes(name)) {
      return 'founding';
    }
    
    // Specialist agents (created on demand)
    return 'specialist';
  }

  private getMaxConcurrentTasks(name: string): number {
    // Agent Lead can handle multiple delegations
    if (name === 'AL') return 5;
    
    // Most agents handle one task at a time
    return 1;
  }

  private getApprovalRequired(name: string): string[] {
    // Security agent requires approval for high-risk operations
    if (name === 'SEC') {
      return ['shell.execute', 'git.push', 'deployment.*'];
    }
    
    // DevOps requires approval for infrastructure changes
    if (name === 'OPS') {
      return ['deployment.*', 'infrastructure.*'];
    }
    
    // Default: no special approval requirements
    return [];
  }

  private getAllowedModelTiers(name: string): string[] {
    // Product Owner and Architect get strongest models
    if (['PO', 'ARC'].includes(name)) {
      return ['strongest', 'standard', 'small'];
    }
    
    // Backend, QA, Security get standard+ models
    if (['BE', 'QA', 'SEC'].includes(name)) {
      return ['standard', 'small'];
    }
    
    // Others get standard models
    return ['standard', 'small'];
  }

  getAgent(name: string): AgentProfile | undefined {
    return this.agents.get(name);
  }

  getAllAgents(): AgentProfile[] {
    return Array.from(this.agents.values());
  }

  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  async spawnAgent(agentName: string, taskContext?: any): Promise<boolean> {
    const profile = this.getAgent(agentName);
    
    if (!profile) {
      console.error(`❌ Agent @${agentName} not found in registry`);
      return false;
    }

    // Check if agent is available (not at max concurrent tasks)
    const activeRuns = await this.prisma.agentRun.count({
      where: {
        agentName,
        status: 'running',
      },
    });

    const agent = await this.prisma.agent.findUnique({
      where: { name: agentName },
    });

    if (!agent) {
      console.error(`❌ Agent @${agentName} not found in database`);
      return false;
    }

    const maxConcurrent = (agent.capabilityPolicy as any)?.maxConcurrentTasks || 1;
    
    if (activeRuns >= maxConcurrent) {
      console.warn(`⚠️ Agent @${agentName} is at max capacity (${activeRuns}/${maxConcurrent})`);
      return false;
    }

    console.log(`🚀 Spawning agent @${agentName} for task execution`);
    return true;
  }
}