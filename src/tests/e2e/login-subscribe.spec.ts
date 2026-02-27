import { expect, test } from "@playwright/test";

test("login flow and subscribe to a topic", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Password").fill("StrongPass123");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/topics/);

  const firstTopicAction = page.getByTestId(/topic-action-/).first();
  await expect(firstTopicAction).toBeVisible();

  const before = await firstTopicAction.innerText();
  await firstTopicAction.click();

  const after = await firstTopicAction.innerText();
  expect(after).not.toEqual(before);
});
