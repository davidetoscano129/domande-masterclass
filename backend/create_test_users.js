const bcrypt = require("bcryptjs");
const { query } = require("./src/config/database");

async function createTestUsers() {
  try {
    console.log("🚀 Creazione utenti di test...");

    // Password di test (in chiaro)
    const testPassword = "test123";
    const adminPassword = "admin123";
    const instructorPassword = "instructor123";

    // Hash delle password
    const hashedTest = await bcrypt.hash(testPassword, 10);
    const hashedAdmin = await bcrypt.hash(adminPassword, 10);
    const hashedInstructor = await bcrypt.hash(instructorPassword, 10);

    console.log("🔐 Password hashate create");

    // Aggiorna gli utenti esistenti con password note
    const updates = [
      {
        email: "admin@test.com",
        password: hashedAdmin,
        plainPassword: "admin123",
      },
      {
        email: "admin@domande-masterclass.com",
        password: hashedAdmin,
        plainPassword: "admin123",
      },
      {
        email: "relatore1@masterclass.com",
        password: hashedInstructor,
        plainPassword: "instructor123",
      },
      {
        email: "relatore2@masterclass.com",
        password: hashedInstructor,
        plainPassword: "instructor123",
      },
      {
        email: "relatore3@masterclass.com",
        password: hashedInstructor,
        plainPassword: "instructor123",
      },
      {
        email: "relatore4@masterclass.com",
        password: hashedInstructor,
        plainPassword: "instructor123",
      },
      {
        email: "relatore5@masterclass.com",
        password: hashedInstructor,
        plainPassword: "instructor123",
      },
    ];

    console.log("📝 Aggiornamento password utenti esistenti...");

    for (const user of updates) {
      await query("UPDATE users SET password = ? WHERE email = ?", [
        user.password,
        user.email,
      ]);
      console.log(`✅ ${user.email} - Password: ${user.plainPassword}`);
    }

    console.log("\n🎉 CREDENZIALI AGGIORNATE:");
    console.log("================================");
    console.log("👑 ADMIN:");
    console.log("   • admin@test.com / admin123");
    console.log("   • admin@domande-masterclass.com / admin123");
    console.log("");
    console.log("👨‍🏫 RELATORI:");
    console.log("   • relatore1@masterclass.com / instructor123");
    console.log("   • relatore2@masterclass.com / instructor123");
    console.log("   • relatore3@masterclass.com / instructor123");
    console.log("   • relatore4@masterclass.com / instructor123");
    console.log("   • relatore5@masterclass.com / instructor123");
    console.log("================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Errore:", error);
    process.exit(1);
  }
}

createTestUsers();
