import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createRecord(data: {
    resourceId: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    userId?: string;
  }) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: data.resourceId },
    });
    if (!resource) throw new NotFoundException('资源不存在');

    const [record] = await this.prisma.$transaction([
      this.prisma.downloadRecord.create({ data }),
      this.prisma.resource.update({
        where: { id: data.resourceId },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    // 异步发送资料邮件
    if (resource.fileUrl && data.email) {
      this.mailService.send({
        to: data.email,
        subject: `【TalentPro】${resource.title} 下载确认`,
        html: `<p>您好 ${data.name}，</p><p>感谢您下载《${resource.title}》。</p><p>下载链接：<a href="${resource.fileUrl}">${resource.fileUrl}</a></p><p>如有任何问题，请联系我们的顾问。</p>`,
      }).catch((err) => {
        this.logger.error(`邮件发送失败: ${err.message}`);
      });
    }

    return { record, fileUrl: resource.fileUrl };
  }

  async findRecords(resourceId?: string, page = 1, pageSize = 20) {
    const skip = getSkip(page, pageSize);
    const where: Prisma.DownloadRecordWhereInput = {};
    if (resourceId) where.resourceId = resourceId;
    const [data, total] = await Promise.all([
      this.prisma.downloadRecord.findMany({ skip, take: pageSize, where, orderBy: { createdAt: 'desc' } }),
      this.prisma.downloadRecord.count({ where }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }
}
