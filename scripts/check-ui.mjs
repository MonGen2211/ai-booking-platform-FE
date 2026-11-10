import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const directory = 'artifacts/ui';
await mkdir(directory, { recursive: true });
const results = [];
try {
  for (const width of [375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:5173');
    await expect(page.getByRole('heading', { name: /Chủ động lịch khám/ })).toBeVisible();
    const cta = page.getByRole('link', { name: 'Đặt lịch khám ngay' });
    const metrics = await cta.evaluate(el => {
      const s = getComputedStyle(el);
      return { height: el.getBoundingClientRect().height, padding: parseFloat(s.paddingInlineStart), color: s.color };
    });
    expect(metrics.height).toBeGreaterThanOrEqual(44);
    expect(metrics.padding).toBeGreaterThanOrEqual(20);
    expect(metrics.color).toBe('rgb(255, 255, 255)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${directory}/home-${width}.png`, fullPage: true });

    await page.getByRole('button', { name: 'Mở trợ lý An Tâm' }).click();
    const chat = page.getByRole('dialog', { name: 'Trợ lý An Tâm' });
    await expect(chat).toBeVisible();
    const chatInput = chat.getByRole('textbox', { name: 'Tin nhắn cho trợ lý An Tâm' });
    await expect(chatInput).toBeFocused();
    await expect(chat.getByRole('button', { name: 'Gửi tin nhắn' })).toBeDisabled();
    await chatInput.fill('Tôi cần hỗ trợ đặt lịch');
    await chatInput.press('Enter');
    await expect(chat.getByRole('log')).toContainText('Tôi cần hỗ trợ đặt lịch');
    await expect(chatInput).toHaveValue('');
    const chatBounds = await chat.boundingBox();
    expect(chatBounds.x).toBeGreaterThanOrEqual(0);
    expect(chatBounds.x + chatBounds.width).toBeLessThanOrEqual(width);
    expect(chatBounds.y).toBeGreaterThanOrEqual(0);
    await page.screenshot({ path: `${directory}/chatbot-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(chat).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Mở trợ lý An Tâm' })).toBeFocused();

    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Email')).toBeFocused();
    const fields = await dialog.locator('.MuiOutlinedInput-notchedOutline').evaluateAll(elements => elements.map(el => getComputedStyle(el).borderTopWidth));
    expect(fields).toEqual(['2px', '1px']); // focused email has MUI's 2px accent border
    const bounds = await dialog.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(15);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 15);
    await dialog.getByLabel('Email').fill('patient@example.com');
    await dialog.locator('input[autocomplete="current-password"]').fill('example-password');
    await dialog.getByRole('button', { name: 'Hiện mật khẩu' }).click();
    await expect(dialog.locator('input[autocomplete="current-password"]')).toHaveAttribute('type', 'text');
    await dialog.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
    await page.screenshot({ path: `${directory}/login-${width}.png` });
    await dialog.getByRole('button', { name: 'Đăng ký', exact: true }).click();
    await expect(dialog.getByText('Sử dụng ít nhất 8 ký tự.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    await page.goto('http://localhost:5173/booking');
    await expect(page.getByRole('tab', { name: 'Đặt lịch khám', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${directory}/booking-${width}.png`, fullPage: true });
    await page.getByRole('tab', { name: 'Lịch hẹn của tôi' }).click();
    await expect(page.getByRole('heading', { name: 'Lịch hẹn của bạn, ở một nơi' })).toBeVisible();
    expect(errors).toEqual([]);
    results.push({ width, cta: metrics, inputBorders: fields, horizontalOverflow: false, runtimeErrors: errors });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
