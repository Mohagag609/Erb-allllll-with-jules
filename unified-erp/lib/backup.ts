import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import prisma from "./prisma";
import { BackupLocation, BackupStatus } from "@prisma/client";

const execAsync = promisify(exec);

async function runLocalBackup() {
  const backupDir = process.env.BACKUP_LOCAL_PATH;
  if (!backupDir) {
    throw new Error("متغير البيئة BACKUP_LOCAL_PATH غير معرّف.");
  }

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dbUrlString = process.env.DATABASE_URL;
  if (!dbUrlString) {
    throw new Error("متغير البيئة DATABASE_URL غير معرّف.");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-${timestamp}.sql.gz`;
  const filePath = path.join(backupDir, fileName);

  // NOTE: pg_dump must be available in the shell's PATH.
  // Using environment variables for credentials is safer than putting them in the command.
  const dbUrl = new URL(dbUrlString);
  const command = `pg_dump --dbname=${dbUrl.pathname.substring(1)} --host=${dbUrl.hostname} --port=${dbUrl.port} --username=${dbUrl.username} --no-password | gzip > "${filePath}"`;

  let backupRecord;
  try {
    console.log("بدء عملية النسخ الاحتياطي المحلي...");

    await execAsync(command, {
        env: { ...process.env, PGPASSWORD: dbUrl.password }
    });

    const stats = fs.statSync(filePath);
    backupRecord = await prisma.backup.create({
      data: {
        location: BackupLocation.local,
        pathOrDriveId: filePath,
        sizeBytes: stats.size,
        status: BackupStatus.ok,
        message: "اكتمل النسخ الاحتياطي بنجاح.",
      },
    });
    console.log(`تم النسخ الاحتياطي بنجاح: ${filePath}`);

  } catch (error: any) {
    console.error("فشل النسخ الاحتياطي:", error);
    await prisma.backup.create({
      data: {
        location: BackupLocation.local,
        pathOrDriveId: filePath,
        status: BackupStatus.failed,
        message: error.message,
      },
    });
    throw error; // Re-throw to indicate failure
  }
}

async function runBackup() {
    const provider = process.env.BACKUP_PROVIDER || 'local';
    console.log(`باستخدام موفر النسخ الاحتياطي: ${provider}`);

    switch(provider) {
        case 'local':
            await runLocalBackup();
            break;
        case 'onedrive':
        case 'gdrive':
            console.warn(`لم يتم تنفيذ النسخ الاحتياطي لموفر الخدمة ${provider} بعد.`);
            // Implementation for cloud providers would go here
            break;
        default:
            throw new Error(`موفر نسخ احتياطي غير معروف: ${provider}`);
    }
}

// This allows the script to be run directly from the command line
if (require.main === module) {
  runBackup()
    .then(() => {
        console.log("انتهت عملية النسخ الاحتياطي.");
        process.exit(0);
    })
    .catch(err => {
        console.error("فشلت عملية النسخ الاحتياطي بشكل كامل:", err);
        process.exit(1);
  });
}
