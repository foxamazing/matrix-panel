package ical

import (
	"context"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"time"

	ics "github.com/arran4/golang-ical"
)

// ICalIntegration represents an iCalendar feed integration
type ICalIntegration struct {
	*integration.BaseIntegration
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

// New 创建 iCalendar 集成实例
func New(id, name, url string, secrets map[string]string) *ICalIntegration {
	return &ICalIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "ical", url, secrets),
	}
}

// TestConnection tests the iCal feed connection
func (i *ICalIntegration) TestConnection(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, "GET", i.URL, nil)
	if err != nil {
		return err
	}

	resp, err := i.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to connect to iCal feed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("iCal feed returned status code %d", resp.StatusCode)
	}

	return nil
}

// GetEvents retrieves upcoming events from the iCal feed
func (i *ICalIntegration) GetEvents(ctx context.Context) ([]CalendarEvent, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", i.URL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := i.Client.Do(req)
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

		// Only include future events or events starting within last 24h
		if dtStart.Before(now.Add(-24 * time.Hour)) {
			continue
		}

		dtEnd, _ := event.GetEndAt()

		calEvent := CalendarEvent{
			UID:         i.getPropertyValue(event, ics.ComponentPropertyUniqueId),
			Summary:     i.getPropertyValue(event, ics.ComponentPropertySummary),
			Description: i.getPropertyValue(event, ics.ComponentPropertyDescription),
			Location:    i.getPropertyValue(event, ics.ComponentPropertyLocation),
			StartTime:   dtStart,
			EndTime:     dtEnd,
			AllDay:      false,
			Status:      i.getPropertyValue(event, ics.ComponentPropertyStatus),
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
	}

	return events, nil
}

func (i *ICalIntegration) getPropertyValue(event *ics.VEvent, prop ics.ComponentProperty) string {
	p := event.GetProperty(prop)
	if p != nil {
		return p.Value
	}
	return ""
}
