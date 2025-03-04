import pytest
from playwright.sync_api import Page, expect


# Test recommendation feature and test scaling
@pytest.fixture
def setup(page: Page):
    page.goto("http://localhost:3000/ai-recommendator")


def test_page_content(setup, page: Page):
    form_locator = page.locator('form')
    expect(page.locator('role=heading[name="Plan Your Trip"]')).to_be_visible()
    expect(form_locator).to_be_visible()
    expect(form_locator.locator('role=heading[name="Where would you like to go?"]')).to_be_visible()
    form_locator.locator('button:text("Next")').click()
    expect(form_locator.locator('role=heading[name="When do you plan to go?"]')).to_be_visible()
    form_locator.locator('button:text("Next")').click()
    expect(form_locator.locator('role=heading[name="Who are you traveling with?"]')).to_be_visible()
    form_locator.locator('button:text("Next")').click()
    expect(form_locator.locator('label').first).to_be_visible()


def test_incomplete_submission(setup, page: Page):
    form_locator = page.locator('form')
    form_locator.locator('button:text("Next")').click()
    form_locator.locator('button:text("Next")').click()
    form_locator.locator('button:text("Next")').click()
    submit_button = form_locator.locator('button:text("Get Recommendations")')
    expect(submit_button).to_be_disabled()


def test_complete_submission(setup, page: Page):
    form_locator = page.locator('form')
    # location selector
    location_locator = page.locator('input[name="location"]')
    expect(location_locator).to_be_visible()
    location_locator.fill('Chicago, Illinois')
    form_locator.locator('button:text("Next")').click()

    # date selector
    date_input_locator = page.locator('input[type="date"][name="trip_date"]')
    expect(date_input_locator).to_be_visible()
    date_input_locator.fill('2025-05-15')
    form_locator.locator('button:text("Next")').click()

    # group selector
    travel_group_select_locator = page.locator('select[name="travel_group"]')
    expect(travel_group_select_locator).to_be_visible()
    travel_group_select_locator.select_option(value='partner')
    form_locator.locator('button:text("Next")').click()

    # interest selector
    interestOptions = [
        "Food",
        "Drinks",
        "Attractions",
        "History",
        "Outdoor",
        "Shopping"
    ]
    for item in interestOptions:
        checkbox_label = page.locator(f'label:has-text("{item}")')
        # Verify that the checkbox labels are visible and interactive
        expect(checkbox_label).to_be_visible()

    # Click the first checkbox and verify the check mark appears
    first_checkbox_span = page.locator('label.checkbox-label:has-text("Food") span')
    first_checkbox_span.click()

    # add custom interest
    custom_input_locator = page.locator('input[type="text"][placeholder="Enter other interests not listed (separated by commas)"]')
    expect(custom_input_locator).to_be_visible()
    custom_input_locator.fill('Music')
    form_locator.locator('button:text("Add")').click()

    # submit - shows loading indicator then redirects
    submit_button = form_locator.locator('button:text("Get Recommendations")')
    expect(submit_button).to_be_enabled()
    submit_button.click()
    loading_indicator_locator = page.locator('.loading-indicator')
    # Assert the loading indicator is visible
    expect(loading_indicator_locator).to_be_visible()  # Timeout in ms
    # Optionally, assert the loading text content is correct
    expect(loading_indicator_locator).to_have_text("Loading...")
    expect(page).to_have_url("http://localhost:3000/ai-recommendation", timeout=30000)

    # Step 3: Check if 'food' is present in the recommendations page
    food_category_locator = page.locator('div.category h3:text("Food")')
    expect(food_category_locator).to_be_visible()

    # Step 4: Check if 'music' is present in the recommendations page
    music_category_locator = page.locator('div.category h3:text("Music")')
    expect(music_category_locator).to_be_visible()

    # Optionally, check if specific items under these categories are visible
    # Check if food category contains at least one item
    food_items_locator = food_category_locator.locator('xpath=following-sibling::ul/li')
    expect(food_items_locator).to_have_count(3)  # Adjust count based on actual items

    # Check if music category contains at least one item
    music_items_locator = music_category_locator.locator('xpath=following-sibling::ul/li')
    expect(music_items_locator).to_have_count(3)  # Adjust count based on actual items
