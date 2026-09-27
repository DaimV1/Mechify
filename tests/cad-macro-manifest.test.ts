import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = new URL("../public/macros/", import.meta.url);

type Entry = {
  file: string;
  sha256: string;
  software: "SolidWorks" | "Inventor";
  targetVersion: string;
  entryPoint: string;
  reviewedOn: string;
  nextReviewDue: string;
  runtimeTested: boolean;
  source: { label: string; url: string };
  limitations: { nl: string; en: string };
};

test("CAD macro manifest covers every download and carries an honest review lifecycle", async () => {
  const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8")) as {
    macros: Entry[];
  };
  const files = (await readdir(root)).filter((file) => file.endsWith(".bas")).sort();
  const entries = [...manifest.macros].sort((a, b) => a.file.localeCompare(b.file));

  assert.deepEqual(entries.map((entry) => entry.file), files);
  assert.equal(new Set(entries.map((entry) => entry.file)).size, files.length);

  const today = new Date().toISOString().slice(0, 10);
  for (const entry of entries) {
    assert.match(entry.reviewedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(entry.nextReviewDue, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.nextReviewDue > entry.reviewedOn, `${entry.file}: invalid review interval`);
    assert.ok(entry.nextReviewDue >= today, `${entry.file}: static review is overdue`);
    assert.equal(entry.runtimeTested, false, `${entry.file}: runtime validation needs recorded CAD evidence`);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.equal(entry.targetVersion, "2024");
    assert.ok(entry.source.url.startsWith("https://help."), `${entry.file}: official API source required`);
    assert.ok(entry.limitations.nl.length > 40 && entry.limitations.en.length > 40);
  }
});

test("CAD macros use the declared host API and expose their declared entry point", async () => {
  const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8")) as {
    macros: Entry[];
  };

  for (const entry of manifest.macros) {
    const bytes = await readFile(join(root.pathname, entry.file));
    const source = bytes.toString("utf8");
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256);
    assert.match(source, /^Attribute VB_Name = "[^"]+"/);
    assert.match(source, /Option Explicit/);
    assert.match(source, new RegExp(`Sub\\s+${entry.entryPoint}\\s*\\(`, "i"));
    if (entry.software === "SolidWorks") {
      assert.match(entry.file, /^solidworks-/);
      assert.match(source, /(?:Application\.SldWorks|SldWorks\.)/);
      assert.doesNotMatch(source, /ThisApplication/);
    } else {
      assert.match(entry.file, /^inventor-/);
      assert.match(source, /ThisApplication/);
      assert.doesNotMatch(source, /SldWorks\./i);
    }
  }
});
