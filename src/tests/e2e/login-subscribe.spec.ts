import { expect, test } from "@playwright/test";

const subscriptionsBaseUrl = process.env.E2E_SUBSCRIPTIONS_URL ?? "http://localhost:8090";
const adminUserId = process.env.E2E_ADMIN_USER_ID ?? "00000000-0000-0000-0000-000000000001";

test("register, login and subscribe to topic", async ({ page, request }) => {
  const unique = `${Date.now()}-${test.info().parallelIndex}`;
  const topicKey = `e2e-topic-${unique}`;
  const topicName = `E2E Topic ${unique}`;

  const createTopicResponse = await request.post(`${subscriptionsBaseUrl}/topics`, {
    headers: {
      "X-User-Id": adminUserId,
      "X-User-Roles": "admin"
    },
    data: {
      key: topicKey,
      name: topicName,
      description: "Topic for e2e auth/subscription flow"
    }
  });
  expect(createTopicResponse.status(), await createTopicResponse.text()).toBe(201);

  const createdTopic = (await createTopicResponse.json()) as { id: string };
  const topicButton = page.getByTestId(`topic-action-${createdTopic.id}`);

  const email = `e2e-user-${unique}@example.com`;
  const password = `StrongPassword!${unique}`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/topics/);

  await expect(topicButton).toBeVisible();
  const before = (await topicButton.textContent())?.trim();
  await topicButton.click();
  await expect(topicButton).not.toHaveText(before ?? "");
});
