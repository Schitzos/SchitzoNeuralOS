import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ModelPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async seedInitialPricing() {
    const pricingVersion = '2026-05-20';
    const effectiveDate = new Date('2026-05-20');

    // Standard industry pricing data (per 1M tokens)
    const pricingData = [
      // Anthropic Claude models
      { provider: 'anthropic', model: 'claude-opus-4.6', inputPrice: 15.0, outputPrice: 75.0 },
      { provider: 'anthropic', model: 'claude-sonnet-4.6', inputPrice: 3.0, outputPrice: 15.0 },
      { provider: 'anthropic', model: 'claude-sonnet-4.5', inputPrice: 3.0, outputPrice: 15.0 },
      { provider: 'anthropic', model: 'claude-sonnet-4', inputPrice: 3.0, outputPrice: 15.0 },
      { provider: 'anthropic', model: 'claude-haiku-4.5', inputPrice: 0.25, outputPrice: 1.25 },
      
      // OpenAI GPT models
      { provider: 'openai', model: 'gpt-4o', inputPrice: 2.5, outputPrice: 10.0 },
      { provider: 'openai', model: 'gpt-4-turbo', inputPrice: 10.0, outputPrice: 30.0 },
      { provider: 'openai', model: 'gpt-4', inputPrice: 30.0, outputPrice: 60.0 },
      { provider: 'openai', model: 'gpt-3.5-turbo', inputPrice: 0.5, outputPrice: 1.5 },
      
      // DeepSeek models
      { provider: 'deepseek', model: 'deepseek-3.2', inputPrice: 0.14, outputPrice: 0.28 },
      { provider: 'deepseek', model: 'deepseek-coder', inputPrice: 0.14, outputPrice: 0.28 },
      
      // MiniMax models
      { provider: 'minimax', model: 'minimax-m2.5', inputPrice: 0.15, outputPrice: 0.6 },
      { provider: 'minimax', model: 'minimax-m2.1', inputPrice: 0.15, outputPrice: 0.6 },
      
      // GLM models
      { provider: 'zhipu', model: 'glm-5', inputPrice: 0.7, outputPrice: 0.7 },
      { provider: 'zhipu', model: 'glm-4', inputPrice: 0.1, outputPrice: 0.1 },
      
      // Qwen models
      { provider: 'alibaba', model: 'qwen3-coder-next', inputPrice: 0.2, outputPrice: 0.6 },
      { provider: 'alibaba', model: 'qwen-turbo', inputPrice: 0.3, outputPrice: 0.6 },
      
      // Generic fallback pricing for unknown models
      { provider: 'generic', model: 'unknown', inputPrice: 1.0, outputPrice: 3.0 },
    ];

    for (const pricing of pricingData) {
      await this.prisma.modelPricing.upsert({
        where: {
          provider_model_pricingVersion: {
            provider: pricing.provider,
            model: pricing.model,
            pricingVersion,
          },
        },
        update: {
          inputPricePer1mTokens: pricing.inputPrice,
          outputPricePer1mTokens: pricing.outputPrice,
          effectiveDate,
        },
        create: {
          provider: pricing.provider,
          model: pricing.model,
          inputPricePer1mTokens: pricing.inputPrice,
          outputPricePer1mTokens: pricing.outputPrice,
          effectiveDate,
          pricingVersion,
        },
      });
    }

    console.log(`✅ Seeded ${pricingData.length} model pricing records (version: ${pricingVersion})`);
  }

  async calculateCost(
    modelName: string,
    providerRoute: string,
    inputTokens: number,
    outputTokens: number,
  ): Promise<number> {
    // Extract provider from route (e.g., "anthropic/claude-sonnet-4" -> "anthropic")
    const provider = providerRoute.split('/')[0] || 'generic';
    
    // Try to find exact model match first
    let pricing = await this.prisma.modelPricing.findFirst({
      where: {
        provider,
        model: modelName,
      },
      orderBy: { effectiveDate: 'desc' },
    });

    // Fallback to generic pricing if model not found
    if (!pricing) {
      pricing = await this.prisma.modelPricing.findFirst({
        where: {
          provider: 'generic',
          model: 'unknown',
        },
        orderBy: { effectiveDate: 'desc' },
      });
    }

    if (!pricing) {
      console.warn(`No pricing found for ${provider}/${modelName}, using default`);
      return (inputTokens * 1.0 + outputTokens * 3.0) / 1_000_000; // Default: $1/$3 per 1M tokens
    }

    const inputCost = (inputTokens * pricing.inputPricePer1mTokens) / 1_000_000;
    const outputCost = (outputTokens * pricing.outputPricePer1mTokens) / 1_000_000;
    
    return inputCost + outputCost;
  }
}