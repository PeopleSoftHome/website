/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared view-count bump for detail-page reads; `model` is a Prisma delegate (e.g. `prisma.news`).
export async function incrementViewCount(model: { update: (args: any) => Promise<any> }, id: string): Promise<void> {
  await model.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}
