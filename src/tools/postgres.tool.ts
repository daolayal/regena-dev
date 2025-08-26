import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

type TableColumn = {
    column_name: string;
    data_type: string;
    is_nullable: string;
};

type TableRelation = {
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
};

type TableSchema = {
    table: string;
    columns: TableColumn[];
    relations: TableRelation[];
};

export async function getDatabaseSchema(): Promise<TableSchema[]> {
    try {

        const tables: { table_name: string }[] = await prisma.$queryRawUnsafe(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE';
        `);

        const schema: TableSchema[] = [];

        for (const {table_name} of tables) {
            const columns: TableColumn[] = await prisma.$queryRawUnsafe(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = '${table_name}'
            `);

            const relations: TableRelation[] = await prisma.$queryRawUnsafe(`
                SELECT kcu.column_name,
                       ccu.table_name  AS foreign_table_name,
                       ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                         JOIN information_schema.key_column_usage AS kcu
                              ON tc.constraint_name = kcu.constraint_name
                         JOIN information_schema.constraint_column_usage AS ccu
                              ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                  AND tc.table_name = '${table_name}';
            `);

            schema.push({
                table: table_name,
                columns,
                relations
            });
        }

        return schema;
    } catch (error) {
        console.error('Error in getDatabaseSchema:', error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
}
