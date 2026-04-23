Feature: Browse companies
  As a developer job-hunting in Silicon Slopes
  I want to browse the directory of Utah tech companies
  So that I can target employers that match my stack and stage

  Background:
    Given I am on /companies
    And companies have loaded

  Scenario: Default view lists every company in a grid
    Then I see a page header "Companies" with the visible count
    And companies appear in a 3-column grid on desktop

  Scenario: Filtering to hiring only
    When I toggle "Hiring only" on
    Then only companies with isHiring = true remain

  Scenario: Filtering by size
    When I select "Startup" in the size toggle
    Then only companies with size = startup remain

  Scenario: Searching by name or description
    When I type "lucid" into the search input
    Then only companies whose name or description contains "lucid" remain

  Scenario: Combining hiring + size + search
    Given I toggle Hiring only on
    And I select Large in the size toggle
    And I search "react"
    Then only hiring large companies whose description mentions React remain

  Scenario: Clearing filters
    Given filters are active
    When I click Clear filters
    Then the grid returns to the full list

  Scenario: Card click opens the company site
    When I click on a company card
    Then a new tab opens to the company's website

  Scenario: Empty state
    Given the active filters match no companies
    Then I see an empty-state message
    And a Clear filters action is available
