import pytest
from playwright.sync_api import Page, expect


# Explore page
# Assumptions: Database has Experiences
@pytest.fixture
def setup_explore_page(page: Page):
    # Setup: Go to the Explore page before each test
    page.goto("http://localhost:3000/explore")


def test_explore_page_elements(setup_explore_page, page: Page):
    expect(page.locator('role=heading[name="Explore Experiences"]')).to_be_visible()
    expect(page.locator('role=button[name="Add New Experience"]')).to_be_visible()
    page.wait_for_selector('.experience-card')
    expect(page.locator('.experience-card').first).to_be_visible()


def test_add_button_redirect(setup_explore_page, page: Page):
    page.locator('role=button[name="Add New Experience"]').click()
    expect(page.locator('form:has-text("Share your experience")')).to_be_visible()
