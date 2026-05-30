import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { LeadStatus } from '@prisma/client';
import { Response } from 'express';

const MAX_EXPORT_ROWS = 50000; // 单次导出最大记录数，防止 OOM
const BATCH_SIZE = 1000; // 游标分页批次大小

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportLeads(
    filters: { status?: LeadStatus; workspaceId?: string },
    res: Response,
  ) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.workspaceId) where.workspaceId = filters.workspaceId;

    const total = await this.prisma.demoBooking.count({ where });
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(`导出记录数超过上限 ${MAX_EXPORT_ROWS}，请缩小筛选范围`);
    }

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res as any,
    });
    const worksheet = workbook.addWorksheet('线索列表');
    worksheet.addRow([
      'ID', '姓名', '公司', '手机', '邮箱', '意向产品',
      '企业规模', '状态', '来源', '跟进次数', '创建时间',
    ]);

    let cursor: { id: string } | undefined;
    let count = 0;
    do {
      const batch = await this.prisma.demoBooking.findMany({
        where,
        include: { followUps: true },
        orderBy: { createdAt: 'desc' },
        take: BATCH_SIZE,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor.id } : undefined,
      });

      for (const l of batch) {
        worksheet.addRow([
          l.id, l.name, l.company, l.phone, l.email || '',
          (l.products || []).join(', '), l.scale, l.status,
          l.source, l.followUps.length, l.createdAt.toISOString(),
        ]);
      }

      count += batch.length;
      cursor = batch.length === BATCH_SIZE ? { id: batch[batch.length - 1].id } : undefined;
    } while (cursor);

    await worksheet.commit();
    await workbook.commit();
  }

  async exportUsers(
    filters: { workspaceId?: string },
    res: Response,
  ) {
    const where: any = {};
    if (filters.workspaceId) where.workspaceId = filters.workspaceId;

    const total = await this.prisma.user.count({ where });
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(`导出记录数超过上限 ${MAX_EXPORT_ROWS}，请缩小筛选范围`);
    }

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res as any,
    });
    const worksheet = workbook.addWorksheet('用户列表');
    worksheet.addRow([
      'ID', '姓名', '邮箱', '手机', '角色',
      '工作空间', 'Workspace角色', '状态', '注册时间',
    ]);

    let cursor: { id: string } | undefined;
    do {
      const batch = await this.prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true,
          status: true, workspaceRole: true, createdAt: true,
          role: { select: { name: true } },
          workspace: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: BATCH_SIZE,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor.id } : undefined,
      });

      for (const u of batch) {
        worksheet.addRow([
          u.id, u.name || '', u.email, u.phone || '',
          u.role?.name || '', u.workspace?.name || '',
          u.workspaceRole || '', u.status, u.createdAt.toISOString(),
        ]);
      }

      cursor = batch.length === BATCH_SIZE ? { id: batch[batch.length - 1].id } : undefined;
    } while (cursor);

    await worksheet.commit();
    await workbook.commit();
  }

  async exportAnalytics(
    days = 30,
    workspaceId: string | undefined,
    res: Response,
  ) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    let userIdsInWorkspace: string[] | undefined;
    if (workspaceId) {
      const users = await this.prisma.user.findMany({
        where: { workspaceId },
        select: { id: true },
      });
      userIdsInWorkspace = users.map((u) => u.id);
    }

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res as any,
    });

    // 页面访问
    const pvWs = workbook.addWorksheet('页面访问');
    pvWs.addRow(['路径', 'Referrer', 'UserAgent', 'IP', '时间']);

    let pvCursor: { id: string } | undefined;
    do {
      const batch = await this.prisma.pageView.findMany({
        where: {
          createdAt: { gte: from },
          ...(userIdsInWorkspace ? { userId: { in: userIdsInWorkspace } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: BATCH_SIZE,
        skip: pvCursor ? 1 : 0,
        cursor: pvCursor ? { id: pvCursor.id } : undefined,
      });
      for (const p of batch) {
        pvWs.addRow([p.path, p.referrer || '', p.userAgent || '', p.ipAddress || '', p.createdAt.toISOString()]);
      }
      pvCursor = batch.length === BATCH_SIZE ? { id: batch[batch.length - 1].id } : undefined;
    } while (pvCursor);
    await pvWs.commit();

    // 事件追踪
    const evWs = workbook.addWorksheet('事件追踪');
    evWs.addRow(['事件', '属性', '时间']);

    let evCursor: { id: string } | undefined;
    do {
      const batch = await this.prisma.eventTrack.findMany({
        where: {
          createdAt: { gte: from },
          ...(userIdsInWorkspace ? { userId: { in: userIdsInWorkspace } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: BATCH_SIZE,
        skip: evCursor ? 1 : 0,
        cursor: evCursor ? { id: evCursor.id } : undefined,
      });
      for (const e of batch) {
        evWs.addRow([e.event, JSON.stringify(e.properties || {}), e.createdAt.toISOString()]);
      }
      evCursor = batch.length === BATCH_SIZE ? { id: batch[batch.length - 1].id } : undefined;
    } while (evCursor);
    await evWs.commit();

    // 线索
    const leadWs = workbook.addWorksheet('线索');
    leadWs.addRow(['姓名', '公司', '手机', '状态', '时间']);

    let leadCursor: { id: string } | undefined;
    do {
      const batch = await this.prisma.demoBooking.findMany({
        where: {
          createdAt: { gte: from },
          ...(workspaceId ? { workspaceId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: BATCH_SIZE,
        skip: leadCursor ? 1 : 0,
        cursor: leadCursor ? { id: leadCursor.id } : undefined,
      });
      for (const l of batch) {
        leadWs.addRow([l.name, l.company, l.phone, l.status, l.createdAt.toISOString()]);
      }
      leadCursor = batch.length === BATCH_SIZE ? { id: batch[batch.length - 1].id } : undefined;
    } while (leadCursor);
    await leadWs.commit();

    await workbook.commit();
  }
}
