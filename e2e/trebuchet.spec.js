import { test, expect } from '@playwright/test';

test.describe('Trebuchet Designer', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Check that the title is correct
    await expect(page).toHaveTitle('Trebuchet Designer');

    // Verify main UI elements are visible
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('#mechanism')).toBeVisible();
  });

  test('should display control buttons', async ({ page }) => {
    await page.goto('/');

    // Check that all main control buttons are present
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Optimize' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gentlify' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Load' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  test('should display particle and constraint controls', async ({ page }) => {
    await page.goto('/');

    // Check particle controls
    await expect(page.getByRole('button', { name: '+ Particle' })).toBeVisible();

    // Check constraint controls
    await expect(page.getByRole('button', { name: '+ Rod' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Slider' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Roller' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Rope' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Pin' })).toBeVisible();
  });

  test('should have presets dropdown', async ({ page }) => {
    await page.goto('/');

    // Check that presets dropdown exists
    await expect(page.locator('#presets')).toBeVisible();
  });

  test('should display range and simulation metrics', async ({ page }) => {
    await page.goto('/');

    // Check that metrics are displayed
    await expect(page.locator('#range')).toBeVisible();
    await expect(page.locator('#peakLoad')).toBeVisible();
    await expect(page.locator('#simtime')).toBeVisible();
  });

  test('should verify range and maximum force ground truth values', async ({ page }) => {
    await page.goto('/');

    // Wait for the default preset to load and simulation to complete
    // The application loads the "Hinged Counterweight" preset by default
    await page.waitForTimeout(1000);

    // Extract the range value
    const rangeText = await page.locator('#range').textContent();
    const rangeValue = parseFloat(rangeText);

    // Extract the peak load (maximum force) value
    const peakLoadText = await page.locator('#peakLoad').textContent();
    const peakLoadValue = parseFloat(peakLoadText);

    // Verify ground truth values (calculated from the default preset simulation)
    // Expected values: Range = 331.2 ft, Peak Force = 1020.3 lbf (±5 tolerance)
    await expect(rangeValue).toBeGreaterThanOrEqual(331.2 - 5);
    await expect(rangeValue).toBeLessThanOrEqual(331.2 + 5);
    await expect(peakLoadValue).toBeGreaterThanOrEqual(1020.3 - 5);
    await expect(peakLoadValue).toBeLessThanOrEqual(1020.3 + 5);
  });

  test('should toggle optimize button and update range', async ({ page }) => {
    await page.goto('/');

    // Wait for the application to load
    await page.waitForTimeout(1000);

    // Get initial range value
    const initialRangeText = await page.locator('#range').textContent();
    const initialRange = parseFloat(initialRangeText);

    // Get the optimize button by ID (text will change, so use stable selector)
    const optimizeButton = page.locator('#optimize');
    await expect(optimizeButton).toBeVisible();
    await expect(optimizeButton).toHaveText('Optimize');

    // Click the optimize button to start optimization
    await optimizeButton.click();

    // Verify button text changes to "Stop"
    await expect(optimizeButton).toHaveText('Stop');

    // Wait for optimization to run for six seconds
    await page.waitForTimeout(6000);

    // Click the button again to stop optimization
    await optimizeButton.click();

    // Verify button text changes back to "Optimize"
    await expect(optimizeButton).toHaveText('Optimize');

    // Get final range value
    const finalRangeText = await page.locator('#range').textContent();
    const finalRange = parseFloat(finalRangeText);

    // Log the range values for analysis
    console.log(`Initial range: ${initialRange.toFixed(1)} ft, Final range: ${finalRange.toFixed(1)} ft`);

    // Verify that optimization achieved at least 600 ft range
    expect(finalRange).toBeGreaterThanOrEqual(600);
  });

  test('should toggle gentlify button and reduce peak load', async ({ page }) => {
    await page.goto('/');

    // Wait for the application to load
    await page.waitForTimeout(1000);

    // Get initial values
    const initialRangeText = await page.locator('#range').textContent();
    const initialRange = parseFloat(initialRangeText);
    const initialPeakLoadText = await page.locator('#peakLoad').textContent();
    const initialPeakLoad = parseFloat(initialPeakLoadText);

    // Get the gentlify button by ID (text will change, so use stable selector)
    const gentlifyButton = page.locator('#gentlify');
    await expect(gentlifyButton).toBeVisible();
    await expect(gentlifyButton).toHaveText('Gentlify');

    // Click the gentlify button to start optimization
    await gentlifyButton.click();

    // Verify button text changes to "Stop"
    await expect(gentlifyButton).toHaveText('Stop');

    // Wait for optimization to run for six seconds
    await page.waitForTimeout(6000);

    // Click the button again to stop optimization
    await gentlifyButton.click();

    // Verify button text changes back to "Gentlify"
    await expect(gentlifyButton).toHaveText('Gentlify');

    // Get final values
    const finalRangeText = await page.locator('#range').textContent();
    const finalRange = parseFloat(finalRangeText);
    const finalPeakLoadText = await page.locator('#peakLoad').textContent();
    const finalPeakLoad = parseFloat(finalPeakLoadText);

    // Log the values for analysis
    console.log(`Initial range: ${initialRange.toFixed(1)} ft, Final range: ${finalRange.toFixed(1)} ft`);
    console.log(`Initial peak load: ${initialPeakLoad.toFixed(1)} lbf, Final peak load: ${finalPeakLoad.toFixed(1)} lbf`);

    // Verify that gentlify maintained range and reduced peak load
    expect(finalRange).toBeGreaterThanOrEqual(initialRange - 10); // Allow small variance
    expect(finalPeakLoad).toBeLessThanOrEqual(450); // Peak load should be reduced significantly
  });
});
