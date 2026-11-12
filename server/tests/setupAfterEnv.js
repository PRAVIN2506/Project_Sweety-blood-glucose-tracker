afterAll(async () => {
    const { default: prisma } = await import("../src/config/database.js");
    await prisma.$disconnect();
});
