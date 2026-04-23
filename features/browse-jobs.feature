Feature: Browse jobs
  As a SLC/Silicon Slopes developer looking for a new role
  I want to filter and search the full job list
  So that I only see openings worth opening a new tab for

  Background:
    Given I am on /jobs
    And jobs have loaded

  Scenario: Default view lists all jobs sorted by recency
    Then I see a page header "Jobs" with the visible count
    And I see every job card in the list
    And the list is sorted by postedAt descending

  Scenario: Filtering by employment type
    When I select "Internship" in the type toggle
    Then only jobs with type = internship remain
    And the URL gains type=internship

  Scenario: Filtering by level
    When I select "Senior" in the level toggle
    Then only jobs with level = senior remain
    And the URL gains level=senior

  Scenario: Filtering by location category
    When I select "Remote" in the location toggle
    Then only jobs whose location includes "Remote" remain
    And the URL gains location=remote

  Scenario: Filtering by topic
    When I toggle the "React" topic pill on
    Then only jobs tagged with React remain
    And the URL gains topic=React

  Scenario: Multiple topic pills combine with OR
    When I toggle "React" and "Fintech" on
    Then jobs tagged with either topic remain

  Scenario: Searching by title or company
    When I type "lucid" into the search input
    Then only jobs whose title or company name contains "lucid" remain
    And the URL gains q=lucid

  Scenario: Clearing all filters
    Given I have applied type, level, and topic filters
    When I click "Clear filters"
    Then every filter returns to default
    And the URL drops all filter query parameters

  Scenario: Apply link opens the external posting
    When I click the "Apply" area on a job card
    Then a new tab opens to the company's careers page

  Scenario: Empty filter combination
    Given the filters match no jobs
    Then I see an empty-state message with guidance
    And a "Clear filters" action remains available

  Scenario: Shareable filter URL
    Given a visitor lands on /jobs?type=internship&topic=React
    Then the Internship button is pressed
    And the React pill is pressed
    And the list is pre-filtered on first paint
