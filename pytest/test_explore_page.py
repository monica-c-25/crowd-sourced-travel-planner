import pytest
from playwright.sync_api import Page, expect


# Explore page
# Assumptions: Database has Experiences
@pytest.fixture
def setup_explore_page(page: Page):
    # Setup: Go to the Explore page before each test
    page.goto("http://localhost:3000/explore")


@pytest.fixture
def login(page: Page):
    page.locator('role=button[name="Login"]').click()
    expect(page).to_have_title("Log in | travel-planner")
    page.fill('#username', 'tester123@testmail.com')
    page.fill('#password', 'Test123!')
    page.locator('button:text("Continue")').click()


def test_explore_page_elements(setup_explore_page, page: Page):
    expect(page.locator('role=heading[name="Explore Experiences"]')).to_be_visible()
    expect(page.locator('role=button[name="Add New Experience"]')).to_be_visible()
    expect(page.locator('role=button[name="Use AI to plan a trip!"]')).to_be_visible()
    page.wait_for_selector('.experience-card')
    expect(page.locator('.experience-card').first).to_be_visible()


def test_add_button_redirect_loggedin(setup_explore_page, login, page: Page):
    page.goto("http://localhost:3000/explore")
    page.locator('role=button[name="Add New Experience"]').click()
    expect(page.locator('form:has-text("Share Your Experience")')).to_be_visible()


def test_add_button_redirect_loggedout(setup_explore_page, page: Page):
    # Set up a handler for the dialog (alert)
    def handle_dialog(dialog):
        if dialog.type == "alert":
            # Check that the alert message is as expected
            assert dialog.message == "You must be signed in to add an experience."
            dialog.accept()  # Accept the alert to close it

    page.locator('role=button[name="Add New Experience"]').click()
    # Listen for the dialog event (alert, confirm, prompt)
    page.on("dialog", handle_dialog)
    expect(page).to_have_url("http://localhost:3000/explore")


def test_ai_button_redirect(setup_explore_page, page: Page):
    page.locator('role=button[name="Use AI to plan a trip!"]').click()
    expect(page.locator('role=heading[name="Plan Your Trip"]')).to_be_visible
