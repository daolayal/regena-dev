import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
    async create(data: { azure_id: string; email: string; name?: string }) {
        return prisma.user.create({ data });
    }

    async findById(id: number) {
        return prisma.user.findUnique({ where: { id } });
    }

    async findByAzureId(azure_id: string) {
        return prisma.user.findUnique({ where: { azure_id } });
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    async update(id: number, data: Partial<{ email: string; name: string }>) {
        return prisma.user.update({ where: { id }, data });
    }

    async delete(id: number) {
        return prisma.user.delete({ where: { id } });
    }
}
