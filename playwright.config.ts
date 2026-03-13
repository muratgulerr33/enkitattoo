import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3002",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3002",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "iphone-se",
      use: {
        ...devices["iPhone SE"],
        browserName: "chromium",
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: "iphone-14-pro-max",
      use: {
        ...devices["iPhone 14 Pro Max"],
        browserName: "chromium",
      },
    },
    {
      name: "pixel-7",
      use: {
        ...devices["Pixel 7"],
      },
    },
    {
      name: "ipad-mini",
      use: {
        ...devices["iPad Mini"],
        browserName: "chromium",
      },
    },
    {
      name: "desktop-1280",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
});
