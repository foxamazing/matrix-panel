package ical

import (
	"fmt"
	"io"
	"net/http"
	"time"

	ics "github.com/arran4/golang-ical"
)

// ICalIntegration represents an iCalendar feed integration
type ICalIntegration struct {
	FeedURL string
	client  *http.Client
}

// CalendarEvent represents a parsed calendar event
type CalendarEvent struct {
	UID         string    `json:"uid"`
	Summary     string    `json:"summary"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
	AllDay      bool      `json:"allDay"`
	Organizer   string    `json:"organizer"`
	Status      string    `json:"status"`
}

// NewICalIntegration creates a new iCalendar integration
func NewICalIntegration(feedURL string) *ICalIntegration {
	return &ICalIntegration{
		FeedURL: feedURL,
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// TestConnection tests the iCal feed connection
func (i *ICalIntegration) TestConnection() error {
	resp, err := i.client.Get(i.FeedURL)
	if err != nil {
		return fmt.Errorf("failed to connect to iCal feed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("iCal feed returned status code %d", resp.StatusCode)
	}

	// Try to parse to verify it's valid iCal
	_, err = io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read iCal feed: %w", err)
	}

	return nil
}

// GetUpcomingEvents retrieves upcoming events from the iCal feed
func (i *ICalIntegration) GetUpcomingEvents(limit int) ([]CalendarEvent, error) {
	resp, err := i.client.Get(i.FeedURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch iCal feed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("iCal feed returned status code %d", resp.StatusCode)
	}

	// Parse iCal data
	cal, err := ics.ParseCalendar(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse iCal data: %w", err)
	}

	events := []CalendarEvent{}
	now := time.Now()

	// Convert iCal events to our format
	for _, event := range cal.Events() {
		dtStart, err := event.GetStartAt()
		if err != nil {
			continue
		}

		// Only include future events
		if dtStart.Before(now) {
			continue
		}

		dtEnd, _ := event.GetEndAt()

		calEvent := CalendarEvent{
			UID:         event.GetProperty(ics.ComponentPropertyUniqueId).Value,
			Summary:     event.GetProperty(ics.ComponentPropertySummary).Value,
			Description: event.GetProperty(ics.ComponentPropertyDescription).Value,
			Location:    event.GetProperty(ics.ComponentPropertyLocation).Value,
			StartTime:   dtStart,
			EndTime:     dtEnd,
			AllDay:      false,
			Status:      event.GetProperty(ics.ComponentPropertyStatus).Value,
		}

		if startProp := event.GetProperty(ics.ComponentPropertyDtStart); startProp != nil {
			if values, ok := startProp.ICalParameters["VALUE"]; ok {
				for _, v := range values {
					if v == "DATE" {
						calEvent.AllDay = true
						break
					}
				}
			}
		}

		if organizer := event.GetProperty(ics.ComponentPropertyOrganizer); organizer != nil {
			calEvent.Organizer = organizer.Value
		}

		events = append(events, calEvent)

		if len(events) >= limit {
			break
		}
	}

	return events, nil
}
