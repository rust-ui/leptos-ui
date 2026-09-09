import { Locator, Page, test, expect } from "@playwright/test";
import { BaseHookPage } from "./_base_page";

/**
 * ============================================================================
 * USE-HISTORY HOOK - VISUAL OVERVIEW
 * ============================================================================
 *
 * HOOK PURPOSE:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                                                                         │
 * │   Undo/redo history stack for URL-based state.                          │
 * │   Tracks URL query strings and navigates between them via               │
 * │   history.replaceState — no new browser history entries created.        │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * DEMO ANATOMY:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                                                                         │
 * │   ┌──● ──● ──● ──● ──● ──●──┐  ← Color swatches                       │
 * │   │ slate red org grn blu vio│    data-color="slate" etc.               │
 * │   │       ↑ active swatch    │    data-active="true/false"              │
 * │   └──────────────────────────┘                                          │
 * │                                                                         │
 * │   Current: slate  ·  1 / 1   ← position counter                        │
 * │                                                                         │
 * │   ┌────────┐  ┌────────┐                                                │
 * │   │← Undo  │  │ Redo →│   ← disabled when at start/end                 │
 * │   └────────┘  └────────┘                                                │
 * │                                                                         │
 * │   ⌘Z  undo    ⌘⇧Z  redo   ← keyboard hints                             │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * STATE MACHINE:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                                                                         │
 * │   click color ──→ push("?color=X") ──→ active derived from URL  ✓      │
 * │                                                                         │
 * │   undo ──→ index-- ──→ current() reacts ──→ active reacts  ✓           │
 * │   redo ──→ index++ ──→ current() reacts ──→ active reacts  ✓           │
 * │                                                                         │
 * │   new pick mid-history ──→ forward stack truncated  ✓                  │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ============================================================================
 */

class UseHistoryPage extends BaseHookPage {
  protected readonly hookName = "use-history";

  readonly undoButton: Locator;
  readonly redoButton: Locator;
  readonly positionText: Locator;

  constructor(page: Page) {
    super(page);
    this.undoButton = page.getByRole("button", { name: /undo/i }).first();
    this.redoButton = page.getByRole("button", { name: /redo/i }).first();
    this.positionText = page.locator("p").filter({ hasText: /Current:/ }).first();
  }

  override async goto(section?: string) {
    await super.goto(section);
    // Wait for WASM to hydrate before interacting
    await this.page.waitForLoadState("networkidle");
  }

  swatch(color: string): Locator {
    return this.page.locator(`[data-color="${color}"]`).first();
  }

  /** Auto-retries until the expected color is active (Playwright retry pattern). */
  async expectActiveColor(color: string): Promise<void> {
    await expect(
      this.page.locator(`[data-color="${color}"][data-active="true"]`).first()
    ).toBeVisible();
  }

  async position(): Promise<string> {
    return (await this.positionText.textContent()) ?? "";
  }
}

/* ========================================================== */
/*                       🧪 TESTS 🧪                          */
/* ========================================================== */

test.describe("Use History Hook", () => {
  /**
   * TEST: Initial State
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   On load (no ?color= in URL):                          │
   *   │   • "slate" swatch is active (default)                  │
   *   │   • Undo button is disabled (nothing to undo)           │
   *   │   • Redo button is disabled (nothing to redo)           │
   *   │   • Position shows 1 / 1                                │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: hook seeds correctly from current URL
   */
  test("initial state: slate active, undo/redo disabled, position 1/1", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await ui.goto();

    await ui.expectActiveColor("slate");
    await expect(ui.undoButton).toBeDisabled();
    await expect(ui.redoButton).toBeDisabled();
    await expect(ui.positionText).toContainText("1 / 1");
  });

  /**
   * TEST: Click Color Updates Active
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   Click "red" swatch                                    │
   *   │         ↓                                               │
   *   │   data-active="true" moves to red                       │
   *   │   URL updates to ?color=red                             │
   *   │   Undo becomes enabled, redo stays disabled             │
   *   │   Position shows 2 / 2                                  │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: push() + active derivation from URL works
   */
  test("clicking a color updates active swatch and URL", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await ui.goto();

    await ui.swatch("red").click();

    await ui.expectActiveColor("red");
    expect(page.url()).toContain("color=red");
    await expect(ui.undoButton).toBeEnabled();
    await expect(ui.redoButton).toBeDisabled();
    await expect(ui.positionText).toContainText("2 / 2");
  });

  /**
   * TEST: Undo Restores Previous Color
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   slate → red → [undo] → slate                         │
   *   │                                                         │
   *   │   After undo:                                           │
   *   │   • active = "slate"                                    │
   *   │   • URL reverts to ?color= (or no color param)          │
   *   │   • Undo disabled again                                 │
   *   │   • Redo enabled                                        │
   *   │   • Position shows 1 / 2                                │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: go_back() re-syncs active color (the bug fix)
   */
  test("undo restores previous color", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await ui.goto();

    await ui.swatch("red").click();
    await ui.undoButton.click();

    await ui.expectActiveColor("slate");
    await expect(ui.undoButton).toBeDisabled();
    await expect(ui.redoButton).toBeEnabled();
    await expect(ui.positionText).toContainText("1 / 2");
  });

  /**
   * TEST: Redo Restores Forward Color
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   slate → red → [undo] → slate → [redo] → red          │
   *   │                                                         │
   *   │   After redo:                                           │
   *   │   • active = "red"                                      │
   *   │   • Redo disabled again                                 │
   *   │   • Undo enabled                                        │
   *   │   • Position shows 2 / 2                                │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: go_forward() re-syncs active color
   */
  test("redo restores forward color", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await ui.goto();

    await ui.swatch("red").click();
    await ui.undoButton.click();
    await ui.redoButton.click();

    await ui.expectActiveColor("red");
    await expect(ui.redoButton).toBeDisabled();
    await expect(ui.undoButton).toBeEnabled();
    await expect(ui.positionText).toContainText("2 / 2");
  });

  /**
   * TEST: New Pick Mid-History Truncates Forward Stack
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   slate → red → orange                                  │
   *   │                   ↑ undo ↑ undo                         │
   *   │   back at slate                                         │
   *   │                   ↓ click green                         │
   *   │   forward stack (red, orange) is gone                   │
   *   │   Position: 2 / 2  (not 2 / 4)                         │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: push() truncates forward history
   */
  test("new pick mid-history truncates forward stack", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await ui.goto();

    await ui.swatch("red").click();
    await ui.swatch("orange").click();
    await ui.undoButton.click();
    await ui.undoButton.click();
    await ui.swatch("green").click();

    await ui.expectActiveColor("green");
    await expect(ui.redoButton).toBeDisabled();
    await expect(ui.positionText).toContainText("2 / 2");
  });

  /**
   * TEST: Multiple Undo/Redo Steps
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   slate → red → blue → violet                           │
   *   │   [undo] → blue                                         │
   *   │   [undo] → red                                          │
   *   │   [redo] → blue                                         │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: multi-step navigation stays consistent
   */
  test("multi-step undo and redo stays consistent", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await ui.goto();

    await ui.swatch("red").click();
    await ui.swatch("blue").click();
    await ui.swatch("violet").click();

    await ui.undoButton.click();
    await ui.expectActiveColor("blue");

    await ui.undoButton.click();
    await ui.expectActiveColor("red");

    await ui.redoButton.click();
    await ui.expectActiveColor("blue");

    await expect(ui.positionText).toContainText("3 / 4");
  });

  /**
   * TEST: Keyboard Shortcut ⌘Z (Undo)
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   slate → red → press ⌘Z → slate                       │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: keyboard shortcut triggers go_back()
   */
  test("keyboard ⌘Z undoes last action", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await ui.goto();

    await ui.swatch("red").click();
    await page.keyboard.press("Meta+z");

    await ui.expectActiveColor("slate");
  });

  /**
   * TEST: Keyboard Shortcut ⌘⇧Z (Redo)
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   slate → red → ⌘Z → slate → ⌘⇧Z → red                │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: keyboard shortcut triggers go_forward()
   */
  test("keyboard ⌘⇧Z redoes last undone action", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await ui.goto();

    await ui.swatch("red").click();
    await page.keyboard.press("Meta+z");
    await page.keyboard.press("Meta+Shift+z");

    await ui.expectActiveColor("red");
  });

  /**
   * TEST: Load with ?color= in URL
   * ─────────────────────────────────────────────────────────────
   *
   *   What we're testing:
   *   ┌─────────────────────────────────────────────────────────┐
   *   │                                                         │
   *   │   Navigate to /docs/hooks/use-history?color=blue        │
   *   │   → "blue" swatch should be active on load              │
   *   │                                                         │
   *   └─────────────────────────────────────────────────────────┘
   *
   *   Validates: seed reads ?color= from URL on init
   */
  test("loads with correct color from URL query param", async ({ page }) => {
    const ui = new UseHistoryPage(page);
    await page.goto(`/docs/hooks/use-history?color=blue`);

    await ui.expectActiveColor("blue");
  });
});
