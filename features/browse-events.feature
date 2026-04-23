Feature: Browse events
  As a SLC/Silicon Slopes developer
  I want to filter and search the full event list
  So that I can find the specific events worth showing up to

  Background:
    Given I am on the /events page
    And events have loaded

  Scenario: Default view lists all upcoming events
    Then I see a page header "Events" with a count of the visible events
    And I see a list of event cards sorted by date ascending
    And the list is not pre-filtered

  Scenario: Filtering by a single topic
    When I toggle the "React" topic pill on
    Then only events whose topics include "React" remain visible
    And the visible count updates
    And the URL gains a topic=React query parameter

  Scenario: Filtering by multiple topics (OR semantics)
    When I toggle both the "React" and "AI/ML" topic pills on
    Then events tagged with React OR AI/ML remain visible
    And the URL gains topic=React,AI/ML

  Scenario: Filtering by format
    When I select the "Online" format toggle
    Then only events where isOnline is true remain visible
    And the URL gains format=online

  Scenario: Filtering by date range
    When I select the "This week" date option
    Then only events occurring in the current week remain visible
    And the URL gains date=week

  Scenario: Searching by title
    When I type "lucid" into the search input
    Then only events whose title or description contains "lucid" remain visible
    And the URL gains q=lucid

  Scenario: Clearing all filters
    Given I have applied topic, date, and format filters
    When I click "Clear filters"
    Then all filters reset to their defaults
    And the URL loses every filter query parameter

  Scenario: Empty result state
    Given the active filter combination matches no events
    Then I see an empty-state message with guidance to adjust filters
    And a "Clear filters" action remains available

  Scenario: Loading and error states
    Given the events are still loading
    Then I see a spinner in place of the event list
    And when the fetch fails
    Then I see an inline error message

  Scenario: Shareable filter URL
    Given another user visits /events?topic=React&date=week
    Then the topic "React" pill appears pressed
    And the "This week" date option appears selected
    And the list is filtered accordingly on first paint
