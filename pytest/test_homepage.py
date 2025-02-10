import pytest
from playwright.sync_api import Page, expect

# Test Homepage
# Assumptions: User is NOT logged in
@pytest.fixture
def setup(page: Page):
    # Setup: Go to the homepage before each test
    page.goto("http://localhost:3000")


def test_homepage_elements(setup, page: Page):
    expect(page).to_have_title("OwlWays Travel")
    expect(page.locator('role=heading[name="Your destination awaits."]')).to_be_visible()
    expect(page.locator('role=link[name="Explore"]')).to_be_visible()
    expect(page.locator('role=link[name="About Us"]')).to_be_visible()
    expect(page.locator('role=button[name="Login"]')).to_be_visible()


def test_explore_link_redirect(setup, page: Page):
    page.locator('role=link[name="Explore"]').click()
    expect(page.locator('role=heading[name="Explore Experiences"]')).to_be_visible()


def test_about_us_link_redirect(setup, page: Page):
    page.locator('role=link[name="About Us"]').click()
    expect(page.locator('role=heading[name="About Us Page"]')).to_be_visible()


def test_login_logout(setup, page: Page):
    user_info = page.locator('.user-info')
    
    # If the user is not logged in
    if not user_info.is_visible():
        page.locator('role=button[name="Login"]').click()
        expect(page).to_have_title("Log in | travel-planner")
        page.fill('#username', 'tester123@testmail.com')
        page.fill('#password', 'Test123!')
        page.locator('button:text("Continue")').click()

        # Ensure we are on the homepage after login
        expect(page.locator('role=heading[name="Your destination awaits."]')).to_be_visible()

    expect(user_info).to_be_visible()

    # Log out
    user_info.click()
    expect(page.locator('.dropdown-menu')).to_be_visible()
    expect(page.locator('.logout-btn')).to_be_visible()
    page.locator('.logout-btn').click()
    expect(page.locator('role=button[name="Login"]')).to_be_visible()