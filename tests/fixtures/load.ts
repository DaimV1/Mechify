import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Loads a JSON fixture from tests/fixtures/reference-cases/<name>.json. */
export function loadFixture<T>(name: string): T {
  const path = fileURLToPath(new URL(`./reference-cases/${name}.json`, import.meta.url));
  return JSON.parse(readFileSync(path, "utf8")) as T;
}
