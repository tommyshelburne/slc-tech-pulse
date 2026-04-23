Feature: Home page overview
  As a SLC/Silicon Slopes developer visiting SLC Tech Pulse
  I want a single glance at what's happening in the local scene
  So that I can decide where to click for depth without reading three separate pages

  Background:
    Given I am on the home page

  Scenario: Hero invites me into the main flows
    Then I see a hero headline "What's happening in Silicon Slopes"
    And I see a "Browse Events" call-to-action linking to /events
    And I see a "View Jobs" call-to-action linking to /jobs

  Scenario: Stats strip reflects live data counts
    Given the data has loaded
    Then I see a "Upcoming Events" stat card with the count of future events
    And I see a "Open Jobs" stat card with the total job count
    And I see a "Companies" stat card with the total company count
    And I see a "This Week" stat card with the count of events happening this week

  Scenario: Upcoming Events section shows the next four
    Given the data has loaded
    Then I see an "Upcoming Events" section with a "View all" link to /events
    And the section lists up to four events sorted by date ascending
    And only future events appear

  Scenario: Open Positions section shows the four most recent jobs
    Given the data has loaded
    Then I see an "Open Positions" section with a "View all" link to /jobs
    And the section lists up to four jobs sorted by postedAt descending

  Scenario: Companies Hiring section shows employers actively hiring
    Given the data has loaded
    Then I see a "Companies Hiring" section with a "View all" link to /companies
    And only companies with isHiring = true appear
    And the section lists up to six companies

  Scenario: Loading state
    Given the data is still loading
    Then each section shows a loading spinner instead of content

  Scenario: Error state
    Given the data fetch failed
    Then each section shows an error message with retry guidance
    And the hero remains visible

  Scenario: Empty state
    Given the fetch succeeded but returned no events, jobs, or companies
    Then each empty section shows an empty-state message
    And the hero remains visible
