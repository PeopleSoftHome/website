import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { workspaceStorage } from '@shared/prisma/workspace.storage';

@Injectable()
export class WorkspaceInterceptor implements NestInterceptor<unknown, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = user?.workspaceId || null;

    return new Observable((subscriber) => {
      workspaceStorage.run(workspaceId, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
