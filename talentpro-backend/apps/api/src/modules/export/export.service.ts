import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as XLSX from 'xlsx';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportLeads(filters: { status?: LeadStatus; workspaceId?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.workspaceId) where.workspaceId = filters.workspaceId;

    const leads = await this.prisma.demoBooking.findMany({
      where,
      include: { followUps: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = leads.map((l) => ({
      'ID': l.id,
      '姓名': l.name,
      '公司': l.company,
      '手机': l.phone,
      '邮箱': l.email || '',
      '意向产品': (l.products || []).join(', '),
      '企业规模': l.scale,
      '状态': l.status,
      '来源': l.source,
      '跟进次数': l.followUps.length,
      '创建时间': l.createdAt.toISOString(),
    }));

    return this.toBuffer(rows, '线索列表');
  }

  async exportUsers(filters: { workspaceId?: string }) {
    const where: any = {};
    if (filters.workspaceId) where.workspaceId = filters.workspaceId;

    const users = await this.prisma.user.findMany({
      where,
      include: { role: { select: { name: true } }, workspace: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const rows = users.map((u) => ({
      'ID': u.id,
      '姓名': u.name || '',
      '邮箱': u.email,
      '手机': u.phone || '',
      '角色': u.role?.name || '',
      '工作空间': u.workspace?.name || '',
      'Workspace角色': u.workspaceRole || '',
      '状态': u.status,
      '注册时间': u.createdAt.toISOString(),
    }));

    return this.toBuffer(rows, '用户列表');
  }

  async exportAnalytics(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const [pageViews, events, leads] = await Promise.all([
      this.prisma.pageView.findMany({ where: { createdAt: { gte: from } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.eventTrack.findMany({ where: { createdAt: { gte: from } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.demoBooking.findMany({ where: { createdAt: { gte: from } }, orderBy: { createdAt: 'desc' } }),
    ]);

    const wb = XLSX.utils.book_new();

    const pvRows = pageViews.map((p) => ({
      '路径': p.path,
      'Referrer': p.referrer || '',
      'UserAgent': p.userAgent || '',
      'IP': p.ipAddress || '',
      '时间': p.createdAt.toISOString(),
    }));
    const pvWs = XLSX.utils.json_to_sheet(pvRows);
    XLSX.utils.book_append_sheet(wb, pvWs, '页面访问');

    const evRows = events.map((e) => ({
      '事件': e.event,
      '属性': JSON.stringify(e.properties || {}),
      '时间': e.createdAt.toISOString(),
    }));
    const evWs = XLSX.utils.json_to_sheet(evRows);
    XLSX.utils.book_append_sheet(wb, evWs, '事件追踪');

    const leadRows = leads.map((l) => ({
      '姓名': l.name,
      '公司': l.company,
      '手机': l.phone,
      '状态': l.status,
      '时间': l.createdAt.toISOString(),
    }));
    const leadWs = XLSX.utils.json_to_sheet(leadRows);
    XLSX.utils.book_append_sheet(wb, leadWs, '线索');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }

  private toBuffer(rows: any[], sheetName: string) {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }
}
