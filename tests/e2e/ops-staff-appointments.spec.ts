import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import postgres from "postgres";
import { expect, test, type Page } from "@playwright/test";

loadEnv({ path: ".env.local", override: false });
loadEnv({ path: ".env", override: false });

const TEST_MONTH = "2026-03";
const ROOT_URL = `/ops/staff/randevular?month=${TEST_MONTH}`;
const TODAY_DATE = "2026-03-13";
const FILLED_DATE = "2026-03-16";
const HIGH_DATE = "2026-03-21";
const LAST_ROW_DATE = "2026-03-31";
const ARTIFACT_DIR = path.join(process.cwd(), "artifacts", "playwright-final-after");
const STAFF_EMAIL = "staff-playwright@enki.test";
const STAFF_PASSWORD = "Playwright123!";
const CUSTOMERS = [
  { email: "aptrmusteri1@enki.test", fullName: "Ayşe Deneme", phone: "+905000000001" },
  { email: "aptrmusteri2@enki.test", fullName: "Berk Deneme", phone: "+905000000002" },
  { email: "aptrmusteri3@enki.test", fullName: "Cem Deneme", phone: "+905000000003" },
];

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};

type CellSnapshot = {
  cell: Rect | null;
  dayNumber: Rect | null;
  occupancy: Rect | null;
  numeralTexts: string[];
  numeralCount: number;
  occupancyLevel: string | null;
};

type LayoutSnapshot = {
  viewport: { width: number; height: number; scrollWidth: number };
  monthCard: Rect | null;
  monthGrid: Rect | null;
  rootFab: Rect | null;
  dayFab: Rect | null;
  daySheet: Rect | null;
  detailSheet: Rect | null;
  createSheet: Rect | null;
  editSheet: Rect | null;
  countBadgeCount: number;
  filledCellState: CellSnapshot;
  todayCellState: CellSnapshot;
  highCellState: CellSnapshot;
  lastRowCell: Rect | null;
};

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("base64url")}:${derivedKey.toString("base64url")}`;
}

async function ensureFixtureData() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Playwright appointments tests.");
  }

  const sql = postgres(databaseUrl, { prepare: false });

  try {
    const staffRows = await sql`
      insert into users (email, password_hash, is_active)
      values (${STAFF_EMAIL}, ${hashPassword(STAFF_PASSWORD)}, true)
      on conflict (email) do update
        set password_hash = excluded.password_hash,
            is_active = true,
            updated_at = now()
      returning id
    `;
    const staff = staffRows[0];

    if (!staff) {
      throw new Error("Playwright staff fixture could not be created.");
    }

    await sql`
      insert into user_profiles (user_id, full_name, display_name)
      values (${staff.id}, 'Playwright Staff', 'Playwright Staff')
      on conflict (user_id) do update
        set full_name = excluded.full_name,
            display_name = excluded.display_name,
            updated_at = now()
    `;
    await sql`delete from user_roles where user_id = ${staff.id}`;
    await sql`
      insert into user_roles (user_id, role)
      values (${staff.id}, 'admin')
      on conflict (user_id, role) do nothing
    `;

    for (const customer of CUSTOMERS) {
      const userRows = await sql`
        insert into users (email, password_hash, phone, is_active)
        values (${customer.email}, ${hashPassword(STAFF_PASSWORD)}, ${customer.phone}, true)
        on conflict (email) do update
          set phone = excluded.phone,
              is_active = true,
              updated_at = now()
        returning id, email
      `;
      const user = userRows[0];

      if (!user) {
        throw new Error(`Fixture customer could not be created for ${customer.email}.`);
      }

      await sql`
        insert into user_profiles (user_id, full_name, display_name)
        values (${user.id}, ${customer.fullName}, ${customer.fullName})
        on conflict (user_id) do update
          set full_name = excluded.full_name,
              display_name = excluded.display_name,
              updated_at = now()
      `;
      await sql`delete from user_roles where user_id = ${user.id}`;
      await sql`
        insert into user_roles (user_id, role)
        values (${user.id}, 'user')
        on conflict (user_id, role) do nothing
      `;
    }

    const customerRows = await sql`
      select id, email from users
      where email in (${CUSTOMERS[0].email}, ${CUSTOMERS[1].email}, ${CUSTOMERS[2].email})
      order by email
    `;
    const customerIds = Object.fromEntries(
      customerRows.map((row) => [row.email, row.id])
    ) as Record<string, string>;

    await sql`
      delete from appointments
      where appointment_date in ('2026-03-13', '2026-03-16', '2026-03-21')
        and created_by_user_id = ${staff.id}
    `;
    await sql`
      insert into appointments (
        customer_user_id,
        appointment_date,
        appointment_time,
        status,
        source,
        notes,
        created_by_user_id
      )
      values
        (${customerIds[CUSTOMERS[0].email]}, '2026-03-13', '11:00', 'scheduled', 'admin', 'Bugün notu', ${staff.id}),
        (${customerIds[CUSTOMERS[1].email]}, '2026-03-16', '13:00', 'scheduled', 'admin', 'İlk kayıt', ${staff.id}),
        (${customerIds[CUSTOMERS[2].email]}, '2026-03-16', '15:30', 'scheduled', 'admin', 'İkinci kayıt', ${staff.id}),
        (${customerIds[CUSTOMERS[0].email]}, '2026-03-21', '09:30', 'scheduled', 'admin', 'Yoğun sabah', ${staff.id}),
        (${customerIds[CUSTOMERS[1].email]}, '2026-03-21', '10:30', 'scheduled', 'admin', 'Yoğun öğle', ${staff.id}),
        (${customerIds[CUSTOMERS[2].email]}, '2026-03-21', '11:30', 'scheduled', 'admin', 'Yoğun blok', ${staff.id})
    `;
  } finally {
    await sql.end();
  }
}

async function login(page: Page) {
  await page.goto("/ops/giris");

  if (page.url().includes("/ops/giris")) {
    await page.getByLabel("E-posta").fill(STAFF_EMAIL);
    await page.getByLabel("Şifre").fill(STAFF_PASSWORD);
    await Promise.all([
      page.waitForURL(/\/ops\/staff\//),
      page.getByRole("button", { name: "Giriş yap" }).click(),
    ]);
  }
}

function assertRectInside(inner: Rect | null, outer: Rect | null, message: string) {
  expect(inner, `${message}: inner rect missing`).not.toBeNull();
  expect(outer, `${message}: outer rect missing`).not.toBeNull();

  if (!inner || !outer) {
    return;
  }

  expect(inner.left, message).toBeGreaterThanOrEqual(outer.left - 0.5);
  expect(inner.top, message).toBeGreaterThanOrEqual(outer.top - 0.5);
  expect(inner.right, message).toBeLessThanOrEqual(outer.right + 0.5);
  expect(inner.bottom, message).toBeLessThanOrEqual(outer.bottom + 0.5);
}

async function captureLayout(page: Page): Promise<LayoutSnapshot> {
  return page.evaluate(
    ({ filledDate, highDate, todayDate, lastRowDate }) => {
      const readRect = (element: Element | null) => {
        if (!(element instanceof HTMLElement)) {
          return null;
        }

        const rect = element.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        };
      };

      const byTestId = (value: string) => document.querySelector(`[data-testid="${value}"]`);
      const readCell = (date: string) => {
        const cell = byTestId(`month-cell-${date}`);
        return {
          cell: readRect(cell),
          dayNumber: readRect(byTestId(`month-cell-day-${date}`)),
          occupancy: readRect(byTestId(`month-cell-occupancy-${date}`)),
          numeralTexts:
            cell instanceof HTMLElement
              ? Array.from(cell.querySelectorAll("span"))
                  .map((node) => node.textContent?.trim() ?? "")
                  .filter((text) => /^\d+$/.test(text))
              : [],
          numeralCount:
            cell instanceof HTMLElement
              ? Array.from(cell.querySelectorAll("span"))
                  .map((node) => node.textContent?.trim() ?? "")
                  .filter((text) => /^\d+$/.test(text)).length
              : 0,
          occupancyLevel:
            cell instanceof HTMLElement ? cell.dataset.occupancy ?? null : null,
        };
      };

      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
        },
        monthCard: readRect(byTestId("appointments-month-card")),
        monthGrid: readRect(byTestId("appointments-month-grid")),
        rootFab: readRect(byTestId("appointments-root-fab")),
        dayFab: readRect(byTestId("appointments-day-fab")),
        daySheet: readRect(byTestId("appointments-day-sheet")),
        detailSheet: readRect(byTestId("appointments-detail-sheet")),
        createSheet: readRect(byTestId("appointments-create-sheet")),
        editSheet: readRect(byTestId("appointments-edit-sheet")),
        countBadgeCount: document.querySelectorAll('[data-testid^="month-cell-count-"]').length,
        filledCellState: readCell(filledDate),
        todayCellState: readCell(todayDate),
        highCellState: readCell(highDate),
        lastRowCell: readRect(byTestId(`month-cell-${lastRowDate}`)),
      };
    },
    {
      filledDate: FILLED_DATE,
      highDate: HIGH_DATE,
      todayDate: TODAY_DATE,
      lastRowDate: LAST_ROW_DATE,
    }
  );
}

async function writeJsonArtifact(name: string, data: unknown) {
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
  await fs.writeFile(path.join(ARTIFACT_DIR, name), JSON.stringify(data, null, 2));
}

async function writeScreenshot(page: Page, name: string) {
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, name), fullPage: false });
}

test.beforeAll(async () => {
  await ensureFixtureData();
});

test("month root full-scale kalir ve state marker'lari hucre icinde kalir", async ({
  page,
}, testInfo) => {
  const projectName = testInfo.project.name;

  await login(page);
  await page.goto(ROOT_URL);
  await page.waitForLoadState("networkidle");

  const initialLayout = await captureLayout(page);
  await writeScreenshot(page, `${projectName}-month-root.png`);

  expect(initialLayout.viewport.scrollWidth).toBeLessThanOrEqual(initialLayout.viewport.width);
  expect(initialLayout.monthCard).not.toBeNull();
  expect(initialLayout.monthGrid).not.toBeNull();
  expect(initialLayout.countBadgeCount).toBe(0);

  if (projectName === "desktop-1280") {
    expect(initialLayout.monthCard?.width ?? 0).toBeGreaterThanOrEqual(
      initialLayout.viewport.width * 0.82
    );
  } else {
    expect(initialLayout.monthCard?.left ?? 999).toBeLessThanOrEqual(1);
    expect(initialLayout.monthCard?.right ?? 0).toBeGreaterThanOrEqual(
      initialLayout.viewport.width - 1
    );
  }

  expect(initialLayout.todayCellState.numeralCount).toBe(1);
  expect(initialLayout.filledCellState.numeralCount).toBe(1);
  expect(initialLayout.highCellState.numeralCount).toBe(1);
  expect(initialLayout.todayCellState.numeralTexts).toEqual(["13"]);
  expect(initialLayout.filledCellState.numeralTexts).toEqual(["16"]);
  expect(initialLayout.highCellState.numeralTexts).toEqual(["21"]);
  expect(initialLayout.todayCellState.occupancyLevel).toBe("low");
  expect(initialLayout.filledCellState.occupancyLevel).toBe("medium");
  expect(initialLayout.highCellState.occupancyLevel).toBe("high");
  assertRectInside(
    initialLayout.todayCellState.occupancy,
    initialLayout.todayCellState.cell,
    "today occupancy marker"
  );
  assertRectInside(
    initialLayout.filledCellState.occupancy,
    initialLayout.filledCellState.cell,
    "filled occupancy marker"
  );
  assertRectInside(
    initialLayout.highCellState.occupancy,
    initialLayout.highCellState.cell,
    "high occupancy marker"
  );
  expect(initialLayout.todayCellState.occupancy?.width ?? 0).toBeLessThan(
    initialLayout.filledCellState.occupancy?.width ?? 0
  );
  expect(initialLayout.filledCellState.occupancy?.width ?? 0).toBeLessThan(
    initialLayout.highCellState.occupancy?.width ?? 0
  );

  await page.getByTestId(`month-cell-${TODAY_DATE}`).click();
  await expect(page.getByTestId("appointments-day-sheet")).toBeVisible();
  await writeScreenshot(page, `${projectName}-today-selected.png`);
  await page.getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("appointments-day-sheet")).toHaveCount(0);

  await page.getByTestId(`month-cell-${FILLED_DATE}`).click();
  await expect(page.getByTestId("appointments-day-sheet")).toBeVisible();
  await expect(page.getByTestId("appointments-day-fab")).toBeVisible();
  await expect(page.getByTestId("appointments-root-fab")).toHaveCount(0);

  await page.getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("appointments-day-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-root-fab")).toBeVisible();

  const selectedLayout = await captureLayout(page);
  await writeScreenshot(page, `${projectName}-month-selected.png`);

  expect(selectedLayout.countBadgeCount).toBe(0);
  expect(selectedLayout.filledCellState.numeralCount).toBe(1);
  assertRectInside(
    selectedLayout.filledCellState.occupancy,
    selectedLayout.filledCellState.cell,
    "selected occupancy marker"
  );

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" }));
  const scrolledLayout = await captureLayout(page);

  expect(scrolledLayout.rootFab).not.toBeNull();
  expect(scrolledLayout.lastRowCell).not.toBeNull();

  if (scrolledLayout.rootFab && scrolledLayout.lastRowCell) {
    expect(scrolledLayout.lastRowCell.bottom).toBeLessThanOrEqual(scrolledLayout.rootFab.top - 8);
  }

  await writeJsonArtifact(`${projectName}-layout.json`, {
    initialLayout,
    selectedLayout,
    scrolledLayout,
  });
});

test("katman gorunurlugu tek aktif odakta kalir", async ({ page }, testInfo) => {
  const projectName = testInfo.project.name;
  const layerLog: Record<string, Record<string, boolean | number | string[]>> = {};

  await login(page);
  await page.goto(ROOT_URL);
  await page.waitForLoadState("networkidle");

  await expect(page.getByTestId("appointments-month-card")).toBeVisible();
  await expect(page.getByTestId("appointments-root-fab")).toBeVisible();
  await expect(page.getByTestId("appointments-day-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-detail-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-create-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-edit-sheet")).toHaveCount(0);
  layerLog.root = {
    rootFabVisible: await page.getByTestId("appointments-root-fab").isVisible(),
    dayVisible: await page.getByTestId("appointments-day-sheet").count(),
    detailVisible: await page.getByTestId("appointments-detail-sheet").count(),
    createVisible: await page.getByTestId("appointments-create-sheet").count(),
    editVisible: await page.getByTestId("appointments-edit-sheet").count(),
  };

  await page.getByTestId(`month-cell-${FILLED_DATE}`).click();
  await expect(page.getByTestId("appointments-day-sheet")).toBeVisible();
  await expect(page.getByTestId("appointments-day-fab")).toBeVisible();
  await expect(page.getByTestId("appointments-detail-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-create-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-edit-sheet")).toHaveCount(0);
  await expect(page.getByText("2 kayıt")).toBeVisible();
  await writeScreenshot(page, `${projectName}-day-sheet.png`);
  layerLog.day = {
    rootFabVisible: await page.getByTestId("appointments-root-fab").count(),
    dayFabVisible: await page.getByTestId("appointments-day-fab").isVisible(),
    chips: await page.locator('[data-testid="appointments-day-sheet"] [data-slot="badge"]').allTextContents(),
  };
  expect(layerLog.day.chips).toEqual(["2 kayıt", "Yeni 16:00"]);

  await page.locator('[data-testid^="day-appointment-"]').first().click();
  await expect(page.getByTestId("appointments-detail-sheet")).toBeVisible();
  await expect(page.getByTestId("appointments-day-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-day-fab")).toHaveCount(0);
  await expect(page.getByTestId("appointments-create-sheet")).toHaveCount(0);
  await writeScreenshot(page, `${projectName}-detail-sheet.png`);
  layerLog.detail = {
    detailVisible: await page.getByTestId("appointments-detail-sheet").isVisible(),
    createVisible: await page.getByTestId("appointments-create-sheet").count(),
    editVisible: await page.getByTestId("appointments-edit-sheet").count(),
  };

  await page.getByRole("button", { name: "Düzenle" }).click();
  await expect(page.getByTestId("appointments-edit-sheet")).toBeVisible();
  await expect(page.getByTestId("appointments-detail-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-day-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-edit-sheet").locator('input[type="date"]')).toBeVisible();
  await writeScreenshot(page, `${projectName}-edit-sheet.png`);
  layerLog.edit = {
    editVisible: await page.getByTestId("appointments-edit-sheet").isVisible(),
    editHasDateInput: await page
      .getByTestId("appointments-edit-sheet")
      .locator('input[type="date"]')
      .count(),
  };

  await page.getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("appointments-day-sheet")).toBeVisible();

  await page.getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("appointments-day-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-root-fab")).toBeVisible();

  await page.getByTestId("appointments-root-fab").click();
  await expect(page.getByTestId("appointments-create-sheet")).toBeVisible();
  await expect(page.getByTestId("appointments-day-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-detail-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-edit-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointment-create-form").locator('input[type="date"]')).toHaveCount(0);
  await writeScreenshot(page, `${projectName}-create-sheet.png`);
  layerLog.create = {
    createVisible: await page.getByTestId("appointments-create-sheet").isVisible(),
    createHasDateInput: await page
      .getByTestId("appointment-create-form")
      .locator('input[type="date"]')
      .count(),
  };

  await page.getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("appointments-create-sheet")).toHaveCount(0);
  await expect(page.getByTestId("appointments-root-fab")).toBeVisible();
  await writeJsonArtifact(`${projectName}-layers.json`, layerLog);
});
