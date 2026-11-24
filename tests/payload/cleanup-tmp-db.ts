import fs from "node:fs/promises";
import path from "node:path";

const DB_FILES = [
  path.resolve(process.cwd(), "tmp-test-visibility.db"),
  path.resolve(process.cwd(), "tmp-test-agent-access.db"),
];

export default function setup() {
  return async () => {
    await Promise.all(
      DB_FILES.flatMap((file) => [file, `${file}-wal`, `${file}-shm`]).map((file) =>
        fs.rm(file, { force: true }).catch(() => {}),
      ),
    );
  };
}
