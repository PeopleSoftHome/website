import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import type { Cluster } from 'ioredis';
import { randomUUID } from 'crypto';
import { REDIS_CLIENT } from '@shared/redis/redis.module';
import { AiGatewayService } from './ai-gateway.service';

export const DEMO_AGENT_CONTEXT = {
  userId: 'public-demo-user',
  workspaceId: 'demo-workspace',
  roles: ['DEMO_USER'],
  permissions: ['ai:demo:analyze', 'ai:demo:action'],
  dataScope: {
    workspaceId: 'demo-workspace',
    dataClasses: ['aggregated_workforce_metrics'],
    fields: ['hiring_funnel', 'engagement', 'capacity', 'cost'],
  },
} as const;

type DemoPrompt = {
  id: string;
  question: string;
  metrics: string[];
  finding: string;
  decision: string;
  action: string;
};

const PROMPTS: DemoPrompt[] = [
  {
    id: 'hiring-efficiency',
    question: 'Why did hiring efficiency drop this quarter?',
    metrics: ['12,481 workforce signals', 'conversion by funnel stage', 'offer acceptance rate'],
    finding: '3 conversion bottlenecks in high-friction funnel stages',
    decision: 'Rebalance recruiter capacity',
    action: 'Shift 18 recruiter hours to the highest-friction funnel stages',
  },
  {
    id: 'attrition-risk',
    question: 'Which teams are most at risk of regrettable attrition?',
    metrics: ['7,208 engagement signals', 'manager pulse', 'team-level risk trend'],
    finding: '2 teams with rising attrition risk',
    decision: 'Launch manager interventions',
    action: 'Create targeted manager check-ins for the two highest-risk teams',
  },
  {
    id: 'workforce-cost',
    question: 'Where can we reduce workforce cost without slowing growth?',
    metrics: ['31 cost and capacity metrics', 'workflow volume', 'approval cycle time'],
    finding: '4 low-leverage activities',
    decision: 'Automate repeatable workflows',
    action: 'Automate four repeatable approvals and recover 126 hours / month',
  },
];

@Injectable()
export class AgentDemoService {
  constructor(
    private readonly gateway: AiGatewayService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis | Cluster,
  ) {}

  async run(input: { promptId?: string; apply?: boolean; locale?: string }) {
    const prompt = PROMPTS.find((item) => item.id === input.promptId) || PROMPTS[0];
    const requestId = randomUUID();
    const providerConfigured = this.isProviderConfigured();

    if (this.config.get('AGENT_DEMO_REQUIRE_PROVIDER', 'false') === 'true' && !providerConfigured) {
      throw new ServiceUnavailableException('Agent demo requires a configured LLM provider');
    }

    const toolResult = this.executeAnalyzeTool(prompt, requestId);
    const response = await this.gateway.chat({
      subject: `agent-demo:${DEMO_AGENT_CONTEXT.workspaceId}`,
      locale: input.locale || 'en',
      message: prompt.question,
      history: [
        {
          role: 'system',
          content: [
            'You are the TalentPro workforce agent demo.',
            'The request is authorized under the following scope:',
            `User=${DEMO_AGENT_CONTEXT.userId}`,
            `Workspace=${DEMO_AGENT_CONTEXT.workspaceId}`,
            `Role=${DEMO_AGENT_CONTEXT.roles.join(',')}`,
            `Permissions=${DEMO_AGENT_CONTEXT.permissions.join(',')}`,
            `DataScope=${DEMO_AGENT_CONTEXT.dataScope.dataClasses.join(',')}`,
            `Tool=analyze_workforce_demo`,
            `ToolResult=${JSON.stringify(toolResult)}`,
            'Do not invent data outside this scope.',
          ].join('\n'),
        },
      ],
    });

    const action = input.apply ? await this.applyAction(prompt, requestId) : null;

    return {
      requestId,
      providerConfigured,
      context: DEMO_AGENT_CONTEXT,
      tool: {
        id: 'analyze_workforce_demo',
        version: '1.0.0',
        risk: 'low',
        dataScope: DEMO_AGENT_CONTEXT.dataScope,
        result: toolResult,
      },
      analysis: {
        question: prompt.question,
        response: response.content,
        finding: prompt.finding,
        decision: prompt.decision,
        action: prompt.action,
      },
      action,
    };
  }

  private executeAnalyzeTool(prompt: DemoPrompt, requestId: string) {
    return {
      requestId,
      workspaceId: DEMO_AGENT_CONTEXT.workspaceId,
      metrics: prompt.metrics,
      finding: prompt.finding,
      decision: prompt.decision,
    };
  }

  private async applyAction(prompt: DemoPrompt, requestId: string) {
    const approval = this.config.get('AGENT_DEMO_ACTION_APPROVAL', 'public-demo-approved');
    const action = {
      id: randomUUID(),
      requestId,
      toolId: 'apply_workforce_action_demo',
      workspaceId: DEMO_AGENT_CONTEXT.workspaceId,
      permission: 'ai:demo:action',
      approval,
      action: prompt.action,
      createdAt: new Date().toISOString(),
      status: 'queued',
    };

    await this.redis.set(
      `ai:demo:action:${action.id}`,
      JSON.stringify(action),
      'EX',
      86_400,
    );

    return action;
  }

  private isProviderConfigured() {
    return Boolean(
      this.config.get('OPENAI_API_KEY') ||
      this.config.get('AZURE_OPENAI_API_KEY') ||
      this.config.get('ANTHROPIC_API_KEY'),
    );
  }
}
