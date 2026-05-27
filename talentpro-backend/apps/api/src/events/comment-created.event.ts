export class CommentCreatedEvent {
  constructor(
    public readonly commentId: string,
    public readonly authorId: string,
    public readonly authorName: string,
    public readonly content: string,
    public readonly parentId: string | null,
    public readonly entityType: string,
    public readonly entityId: string,
  ) {}
}
