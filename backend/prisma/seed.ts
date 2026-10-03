import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";
import { Role } from "../generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const adminPassword = await bcrypt.hash("AdminDemo@123", 10);
    const userPassword = await bcrypt.hash("UserDemo@123", 10);
    const ownerPassword = await bcrypt.hash("OwnerDemo@123", 10);

    const admin = await prisma.user.upsert({
        where: {
            email: "admin.demo@store-rating.local",
        },
        update: {},
        create: {
            name: "System Administrator Demo",
            email: "admin.demo@store-rating.local",
            password: adminPassword,
            address: "Kolhapur, Maharashtra, India",
            role: Role.ADMIN,
        },
    });

    const user = await prisma.user.upsert({
        where: {
            email: "user.demo@store-rating.local",
        },
        update: {},
        create: {
            name: "Demo Normal User Account",
            email: "user.demo@store-rating.local",
            password: userPassword,
            address: "Kolhapur, Maharashtra, India",
            role: Role.USER,
        },
    });

    const owner = await prisma.user.upsert({
        where: {
            email: "owner.demo@store-rating.local",
        },
        update: {},
        create: {
            name: "Demo Store Owner Account",
            email: "owner.demo@store-rating.local",
            password: ownerPassword,
            address: "Kolhapur, Maharashtra, India",
            role: Role.STORE_OWNER,
        },
    });

    const store = await prisma.store.upsert({
        where: {
            email: "demo.store@store-rating.local",
        },
        update: {
            ownerId: owner.id,
        },
        create: {
            name: "Demo Healthcare Store Kolhapur",
            email: "demo.store@store-rating.local",
            address: "Rankala Road, Kolhapur, Maharashtra, India",
            ownerId: owner.id,
        },
    });

    await prisma.rating.upsert({
        where: {
            userId_storeId: {
                userId: user.id,
                storeId: store.id,
            },
        },
        update: {
            rating: 5,
        },
        create: {
            rating: 5,
            userId: user.id,
            storeId: store.id,
        },
    });

    console.log("Database seed completed successfully.");
    console.log("");
    console.log("Demo accounts:");
    console.log(`Admin: ${admin.email} / AdminDemo@123`);
    console.log(`User: ${user.email} / UserDemo@123`);
    console.log(`Store Owner: ${owner.email} / OwnerDemo@123`);
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });