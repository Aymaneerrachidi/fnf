import { expect, test } from "@playwright/test";

const state = process.env.FNF_QA_STATE ? JSON.parse(process.env.FNF_QA_STATE) : null;
const qa = state || {
  password: process.env.FNF_E2E_PASSWORD,
  users: [
    { email: process.env.FNF_E2E_USER_ONE },
    { email: process.env.FNF_E2E_USER_TWO },
  ],
};

test.skip(!qa.password || qa.users.some((user) => !user.email), "Provide FNF_QA_STATE or the FNF_E2E_* credentials.");
test.describe.configure({ mode: "serial" });

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function signIn(page, user) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /Already have an account/ }).click();
  await dialog.getByLabel("Email").fill(user.email);
  await dialog.getByLabel("Password").fill(qa.password);
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/app");
  await expect(page.locator(".app-sidebar")).toBeVisible();
}

async function openTab(page, name) {
  await page.locator(".app-sidebar nav").getByRole("button", { name: new RegExp(`^${name}`) }).click();
}

test("login retries a transient Supabase network failure", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  let firstAttempt = true;
  await page.route("**/auth/v1/token**", async (route) => {
    if (firstAttempt) {
      firstAttempt = false;
      await route.abort("failed");
      return;
    }
    await route.continue();
  });
  await signIn(page, qa.users[0]);
  await expect(page).toHaveURL(/\/app$/);
  expect(firstAttempt).toBe(false);
  await context.close();
});

test("public controls, social graph, crews, live room, feed and market context work end to end", async ({ browser }) => {
  const contextOne = await browser.newContext();
  const contextTwo = await browser.newContext();
  const owner = await contextOne.newPage();
  const member = await contextTwo.newPage();
  const ownerErrors = watchErrors(owner);
  const memberErrors = watchErrors(member);
  const roomName = `QA Circle ${Date.now().toString().slice(-6)}`;

  await owner.goto("/");
  await expect(owner.getByRole("heading", { name: "Find your trading crew." })).toBeVisible();
  const sound = owner.getByRole("button", { name: /interface sounds/i });
  const soundBefore = await sound.getAttribute("aria-pressed");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", soundBefore === "true" ? "false" : "true");

  await signIn(owner, qa.users[0]);
  const routes = [
    ["Crews", "/discover", "Find your trading crew."],
    ["People", "/people", "Your trading network."],
    ["Messages", "/messages", "Messages."],
    ["Markets", "/markets", "Markets belong inside the conversation."],
    ["My rooms", "/rooms", "My rooms."],
    ["Requests", "/requests", "Seat requests."],
    ["Activity", "/notifications", "Notifications."],
    ["Profile", "/profile", "Profile."],
    ["Home", "/app", /Your people are here/],
  ];
  for (const [label, path, heading] of routes) {
    await openTab(owner, label);
    await expect(owner).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`));
    await expect(owner.getByRole("heading", { name: heading }).first()).toBeVisible();
  }

  await openTab(owner, "Profile");
  await owner.getByLabel("Location").fill("Paris, France");
  await owner.getByLabel("Looking for").selectOption("open");
  await owner.getByLabel("What you bring to a room").fill("Calm research, clear invalidations and regular voice sessions.");
  await owner.getByRole("button", { name: "Save profile" }).click();
  await expect(owner.getByText("Profile saved.")).toBeVisible();

  await owner.locator(".app-sidebar").getByRole("button", { name: /Open market/ }).click();
  await expect(owner.getByRole("heading", { name: "Inspect without leaving." })).toBeVisible();
  await owner.getByRole("button", { name: "Close market drawer" }).click();
  await expect(owner.getByRole("heading", { name: "Inspect without leaving." })).toBeHidden();

  await openTab(owner, "Home");
  await owner.getByRole("button", { name: /Start a crew/ }).first().click();
  let dialog = owner.getByRole("dialog");
  await dialog.getByLabel("Crew name").fill(roomName);
  await dialog.getByLabel("What the room trades").fill("Exact contracts, patient research and small-room conversation.");
  await dialog.getByLabel("About the room").fill("A focused QA room used to verify the complete FNF social loop.");
  await dialog.getByLabel("Trading").selectOption("Memecoins");
  await dialog.getByLabel("Language").selectOption("English");
  await dialog.getByRole("button", { name: "Create crew" }).click();
  await expect(dialog.getByText(`${roomName} is live`)).toBeVisible();
  await dialog.getByRole("button", { name: "See it on the board" }).click();
  await owner.getByRole("button", { name: "Close crew details" }).click();
  await expect(owner.getByRole("button", { name: "Close crew details" })).toBeHidden();

  await openTab(owner, "My rooms");
  const ownerRoom = owner.locator(".app-room-card").filter({ hasText: roomName });
  await ownerRoom.getByRole("button", { name: "Manage room" }).click();
  await expect(owner.getByText("LIVE ROOM")).toBeVisible({ timeout: 30_000 });

  const roomComposer = owner.getByLabel(new RegExp(`Message ${roomName}`));
  await roomComposer.fill("First room note from the owner.");
  await roomComposer.press("Enter");
  await expect(owner.getByText("First room note from the owner.")).toBeVisible();
  await owner.getByRole("button", { name: "Pin message" }).last().click();
  await expect(owner.getByText("Pinned in this room")).toBeVisible();

  await owner.getByRole("button", { name: "Poll", exact: true }).click();
  const poll = owner.locator(".poll-composer");
  await poll.getByPlaceholder("What should the room discuss next?").fill("What should we research next?");
  await poll.getByPlaceholder("Option 1").fill("New launches");
  await poll.getByPlaceholder("Option 2").fill("Second waves");
  await poll.getByRole("button", { name: "Post poll" }).click();
  await expect(owner.locator(".feed-poll strong").filter({ hasText: "What should we research next?" })).toBeVisible();
  await owner.getByRole("button", { name: "New launches" }).click();

  await owner.getByRole("button", { name: "Sessions" }).click();
  await owner.getByRole("button", { name: "Schedule" }).click();
  await owner.getByLabel("Session name").fill("QA room ritual");
  await owner.getByLabel("Starts").fill("2026-09-05T20:00");
  await owner.getByLabel("Context").fill("Bring one thesis and one invalidation.");
  await owner.getByRole("button", { name: "Schedule session" }).click();
  await expect(owner.getByText("QA room ritual")).toBeVisible();
  await owner.getByRole("button", { name: "Enter room" }).click();
  await expect(owner.getByRole("button", { name: "Feed" })).toHaveClass(/active/);

  await owner.getByRole("button", { name: "Unmute" }).click();
  await expect(owner.getByRole("button", { name: "Mute" })).toBeVisible();
  await owner.getByRole("button", { name: "Deafen" }).click();
  await expect(owner.getByRole("button", { name: "Undeafen" })).toBeVisible();
  await owner.getByRole("button", { name: "Undeafen" }).click();
  await owner.getByRole("button", { name: "Share screen" }).click();
  await expect(owner.getByRole("button", { name: "Stop share" })).toBeVisible({ timeout: 15_000 });
  await owner.getByRole("button", { name: "Stop share" }).click();

  await owner.getByRole("button", { name: "Room settings" }).click();
  await owner.getByLabel("Short manifesto").fill("Research in public. Size in private.");
  await owner.getByLabel("Room rituals").fill("Sunday thesis · daily voice · no cold calls");
  await owner.getByRole("button", { name: "Save room" }).click();
  await expect(owner.getByText("Room identity saved.")).toBeVisible();
  await owner.getByRole("button", { name: "Leave", exact: true }).click();
  await expect(owner).toHaveURL(/\/rooms$/);

  await signIn(member, qa.users[1]);
  await openTab(member, "Crews");
  const boardRoom = member.locator(".app-room-card").filter({ hasText: roomName });
  await boardRoom.locator(".app-room-card__body").click();
  dialog = member.getByRole("dialog");
  await dialog.getByPlaceholder("Why does this crew fit how you communicate?").fill("I trade the same hours and prefer small voice rooms.");
  await dialog.getByPlaceholder("When are you usually around?").fill("Europe evenings");
  await dialog.getByPlaceholder("What do you bring to the room?").fill("Research notes and disciplined exits");
  await dialog.getByRole("button", { name: "Request a seat" }).click();
  await expect(dialog.getByText(/Request sent|Seat requested/i)).toBeVisible({ timeout: 20_000 });
  await dialog.getByRole("button", { name: "Close" }).click();

  await openTab(owner, "Requests");
  const currentRequest = owner.locator(".app-request-list article").filter({ hasText: roomName });
  await expect(currentRequest).toBeVisible({ timeout: 15_000 });
  await currentRequest.getByRole("button", { name: /Approve seat/ }).click();
  await expect(currentRequest).toBeHidden();

  await expect(member.locator(".live-toast")).toContainText(/seat is open|enter .* now/i, { timeout: 15_000 });
  await member.locator(".live-toast").click();
  await expect(member).toHaveURL(/\/room\//, { timeout: 30_000 });
  await expect(member.getByText("LIVE ROOM")).toBeVisible({ timeout: 30_000 });
  await member.getByRole("button", { name: "Leave", exact: true }).click();

  await openTab(owner, "People");
  const ownerPerson = owner.locator(".person-card").filter({ hasText: "QA Trader Two" });
  const ownerConnect = ownerPerson.getByRole("button", { name: "Connect" });
  await expect(ownerConnect).toBeVisible({ timeout: 15_000 });
  await ownerConnect.click();
  await expect(ownerPerson.getByRole("button", { name: "Request sent" })).toBeVisible({ timeout: 20_000 });

  await openTab(member, "People");
  const waiting = member.locator(".connection-requests").filter({ hasText: "QA Trader" });
  await expect(waiting).toBeVisible({ timeout: 15_000 });
  await waiting.getByRole("button", { name: "Connect" }).click();

  await openTab(owner, "People");
  const messageButton = owner.locator(".person-card").filter({ hasText: "QA Trader Two" }).getByRole("button", { name: "Message" });
  await expect(messageButton).toBeVisible({ timeout: 15_000 });
  await messageButton.click();
  await expect(owner).toHaveURL(/\/messages$/);
  await owner.getByPlaceholder("Message QA Trader Two").fill("Private QA hello.");
  await owner.getByRole("button", { name: "Send" }).click();
  await expect(owner.locator(".dm-messages").getByText("Private QA hello.")).toBeVisible();

  await openTab(member, "Messages");
  await member.locator(".dm-shell aside").getByRole("button").first().click();
  await expect(member.locator(".dm-messages").getByText("Private QA hello.")).toBeVisible({ timeout: 15_000 });
  await member.getByPlaceholder(/Message QA Trader/).fill("Received in real time.");
  await member.getByRole("button", { name: "Send" }).click();
  await expect(owner.locator(".dm-messages").getByText("Received in real time.")).toBeVisible({ timeout: 15_000 });

  await openTab(owner, "Markets");
  const ca = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
  await owner.getByLabel("Search exact contract address").fill(ca);
  await owner.getByRole("button", { name: "Resolve contract" }).click();
  await expect(owner.locator(".market-symbol strong")).toContainText(/Bonk/i, { timeout: 30_000 });
  await owner.getByRole("button", { name: "Save token" }).click();
  await expect(owner.getByText(/Bonk saved\./i)).toBeVisible();
  await owner.locator(".saved-token").filter({ hasText: /Bonk/i }).click();
  await expect(owner.locator(".compare-board").getByText(/Bonk/i).first()).toBeVisible();
  await owner.getByRole("button", { name: /Remove Bonk/i }).click();
  await owner.locator(".market-room-share select").selectOption({ label: roomName });
  await owner.locator(".market-room-share").getByRole("button", { name: "Send" }).click();
  await expect(owner.getByText(`Shared with ${roomName}.`)).toBeVisible();
  await owner.getByRole("button", { name: "Add MC alert" }).click();
  await owner.getByRole("button", { name: "Save alert" }).click();
  await expect(owner.getByText("Market-cap alert saved.")).toBeVisible();
  await owner.getByRole("button", { name: "Delete alert" }).click();
  await expect(owner.getByText("No market alerts.")).toBeVisible();
  await owner.getByRole("button", { name: "Saved", exact: true }).click();
  await expect(owner.getByText("Removed from your market shelf.")).toBeVisible();

  await openTab(owner, "My rooms");
  await owner.locator(".app-room-card").filter({ hasText: roomName }).getByRole("button", { name: "Manage room" }).click();
  await expect(owner.getByText("LIVE ROOM")).toBeVisible({ timeout: 30_000 });
  await owner.getByRole("button", { name: "Room settings" }).click();
  await owner.getByRole("button", { name: "Archive room" }).click();
  await expect(owner.getByText(`Click Archive room again to confirm ${roomName}.`)).toBeVisible();
  await owner.getByRole("button", { name: "Archive room" }).click();
  await expect(owner).toHaveURL(/\/rooms$/, { timeout: 20_000 });

  await contextOne.close();
  await contextTwo.close();
  expect(ownerErrors, `Owner console errors: ${ownerErrors.join("\n")}`).toEqual([]);
  expect(memberErrors, `Member console errors: ${memberErrors.join("\n")}`).toEqual([]);
});

test("mobile navigation and authentication remain usable", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = watchErrors(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const mobileMenu = page.locator(".mobile-menu");
  await expect(mobileMenu).toBeVisible();
  const sound = mobileMenu.getByRole("button", { name: /Interface sounds/ });
  const before = await sound.getAttribute("aria-pressed");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", before === "true" ? "false" : "true");
  await mobileMenu.getByRole("button", { name: "Create account" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /Already have an account/ }).click();
  await dialog.getByLabel("Email").fill(qa.users[0].email);
  await dialog.getByLabel("Password").fill(qa.password);
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/app");
  await expect(page.locator(".app-mobile-head")).toBeVisible();
  await expect(page.locator(".app-mobile-nav")).toBeVisible();

  for (const label of ["Crews", "People", "Messages", "Markets", "My rooms", "Requests", "Activity", "Profile", "Home"]) {
    await page.locator(".app-mobile-nav").getByRole("button", { name: new RegExp(`^${label}`) }).click();
  }
  await expect(page).toHaveURL(/\/app$/);
  expect(errors, `Mobile console errors: ${errors.join("\n")}`).toEqual([]);
  await context.close();
});
