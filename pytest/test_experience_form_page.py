import pytest
from playwright.sync_api import Page, expect


@pytest.fixture
def setup_experience_form(page: Page):
    # Setup: Go to Experience form page before each test
    page.goto("http://localhost:3000/experience-form")


def test_cancel_button(setup_experience_form, page: Page):
    expect(page.locator('role=button[name="Cancel"]')).to_be_visible()
    page.locator('role=button[name="Cancel"]').click()
    expect(page.locator('role=heading[name="Explore Experiences"]')).to_be_visible()


def test_incomplete_submission(setup_experience_form, page: Page):
    page.fill('#title', 'pytest title')
    page.fill('#description', 'pytest description')
    page.locator('button[type="submit"]').click()
    # Did not redirect (due to incompleted form)
    expect(page.locator('role=heading[name="Share Your Experience"]')).to_be_visible()


def test_complete_submission(setup_experience_form, page: Page):
    # Set up a handler for the dialog (alert)
    def handle_dialog(dialog):
        if dialog.type == "alert":
            # Check that the alert message is as expected
            assert dialog.message == "Experience added successfully!"
            dialog.accept()  # Accept the alert to close it

    # Listen for the dialog event (alert, confirm, prompt)
    page.on("dialog", handle_dialog)
    page.fill('#title', 'pytest title')
    page.fill('#description', 'pytest description')
    page.fill('#location', 'Eiffel Tower')
    page.locator('button[type="submit"]').click()
    expect(page.locator('role=heading[name="Explore Experiences"]')).to_be_visible()
