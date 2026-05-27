import { Injectable } from '@nestjs/common';

// 占位：安装 prom-client 后启用真实实现
// npm install prom-client

@Injectable()
export class PrometheusService {
  // 占位计数器，安装 prom-client 后替换为真实实现
  httpRequestsTotal = { inc: () => {} };
  httpRequestDuration = { observe: () => {} };

  async getMetrics(): Promise<string> {
    return '# Prometheus metrics placeholder. Install prom-client to enable.';
  }
}
