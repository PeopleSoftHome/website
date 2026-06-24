import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailService } from '../modules/mail/mail.service';

@Processor('lead-nurture')
export class LeadNurtureProcessor extends WorkerHost {
  private readonly logger = new Logger(LeadNurtureProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      switch (job.name) {
        case 'lead-nurture-day3':
          await this.sendDay3FollowUp(job.data);
          break;
        case 'lead-nurture-day7':
          await this.sendDay7FollowUp(job.data);
          break;
        case 'lead-nurture-day14':
          await this.sendDay14FollowUp(job.data);
          break;
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (err) {
      this.logger.error(`Job ${job.id} failed: ${err.message}`, err.stack);
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Lead nurture job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${err.message}`,
      {
        deadLetter: {
          queue: 'lead-nurture',
          jobId: job.id,
          name: job.name,
          data: job.data,
          error: err.message,
          stack: err.stack,
        },
      },
    );
  }

  private async sendDay3FollowUp(data: { email: string; name: string; products: string[] }) {
    if (!data.email) return;
    const productText = data.products?.length ? `您感兴趣的 ${data.products.join('、')} 模块` : 'TalentPro 一体化 HR SaaS';
    await this.mailService.send({
      to: data.email,
      subject: '【TalentPro】为您准备的专属产品资料',
      html: `<p>您好 ${data.name}，</p>
<p>3天前您预约了 TalentPro 产品演示。在等待顾问联系期间，我们为您准备了${productText}的详细资料。</p>
<p><a href="https://talentpro.cn/resources">查看资料中心 →</a></p>
<p>如需提前沟通，请拨打 400-888-8888。</p>`,
    });
  }

  private async sendDay7FollowUp(data: { email: string; name: string; products: string[] }) {
    if (!data.email) return;
    await this.mailService.send({
      to: data.email,
      subject: '【TalentPro】客户成功案例精选',
      html: `<p>您好 ${data.name}，</p>
<p>想了解一下同行业企业如何使用 TalentPro 实现数字化转型的吗？</p>
<p>我们整理了制造业、互联网、零售等行业的最佳实践案例。</p>
<p><a href="https://talentpro.cn/resources?type=case">查看客户案例 →</a></p>`,
    });
  }

  private async sendDay14FollowUp(data: { email: string; name: string }) {
    if (!data.email) return;
    await this.mailService.send({
      to: data.email,
      subject: '【TalentPro】我们还在等您',
      html: `<p>您好 ${data.name}，</p>
<p>两周前您表达了了解 TalentPro 的意向。我们非常重视您的需求。</p>
<p>如果您还没有收到顾问的联系，或者希望重新安排演示时间，请直接回复此邮件或拨打 400-888-8888。</p>
<p><a href="https://talentpro.cn/?openDemo=1">重新预约演示 →</a></p>`,
    });
  }
}
