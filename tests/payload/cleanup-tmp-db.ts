import fs from "node:fs/promises";
import path from "node:path";

const DB_FILE = path.resolve(process.cwd(), "tmp-test-visibility.db");

export default function setup() {
  return async () => {
    await Promise.all(
      [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`].map((file) =>
        fs.rm(file, { force: true }).catch(() => {}),
      ),
    );
  };
}
