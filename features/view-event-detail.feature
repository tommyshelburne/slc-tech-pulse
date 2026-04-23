Feature: View event detail
  As a visitor who clicked into a specific event
  I want all the context I need before registering
  So that I can decide whether to commit to attending

  Background:
    Given I am on /events/react-slc-may-2026

  Scenario: Renders the selected event
    Then I see the event title as an h1
    And I see the event date and time formatted for humans
    And I see the event location (or "Online" if remote)
    And I see a Register call-to-action linking to the event's URL in a new tab
    And I see a Back link to /events

  Scenario: Two-column body
    Then I see the full description in a primary column
    And I see an info sidebar with date, time, venue, organizer, and topic badges

  Scenario: Related events
    Given the current event has the topic "React"
    And there are other events also tagged "React"
    Then I see up to three related events in a "Related events" section
    And the current event does not appear in the related list

  Scenario: No related events
    Given no other events share a topic with the current event
    Then the "Related events" section is omitted entirely

  Scenario: Not found
    Given I navigate to /events/does-not-exist
    Then I see an event-not-found message
    And I see a link back to /events

  Scenario: Loading state
    Given the events are still loading on first visit
    Then I see a loading spinner
    And the rest of the page does not render until data is ready
