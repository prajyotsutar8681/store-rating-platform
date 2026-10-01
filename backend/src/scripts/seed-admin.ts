import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client';

async function main() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL is not configured');
    }

    const adminEmail =
        process.env.ADMIN_EMAIL || 'admin@store-rating.local';

    const adminPassword =
        process.env.ADMIN_PASSWORD || 'Admin@1234';

    const adapter = new PrismaPg({
        connectionString,
    });

    const prisma = new PrismaClient({
        adapter,
    });

    try {
        const existingAdmin = await prisma.user.findUnique({
            where: {
                email: adminEmail,
            },
        });

        if (existingAdmin) {
            if (existingAdmin.role !== Role.ADMIN) {
                await prisma.user.update({
                    where: {
                        id: existingAdmin.id,
                    },
                    data: {
                        role: Role.ADMIN,
                    },
                });

                console.log(
                    `Existing user ${adminEmail} has been promoted to ADMIN.`,
                );
            } else {
                console.log(`Admin ${adminEmail} already exists.`);
            }

            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        const admin = await prisma.user.create({
            data: {
                name: 'System Administrator',
                email: adminEmail,
                password: hashedPassword,
                address: 'Store Rating Platform Administration',
                role: Role.ADMIN,
            },
        });

        console.log('Admin created successfully.');
        console.log(`ID: ${admin.id}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Role: ${admin.role}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error('Admin seed failed:', error);
    process.exit(1);
});