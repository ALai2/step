// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.ArrayList;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    // get mandatory attendees of meeting request
    Collection<String> attendees = request.getAttendees();

    // iterate through events and get timeranges of events that attendees are in
    ArrayList<TimeRange> outOfRange = new ArrayList<TimeRange>();
    for (Event event: events) {
      boolean addEvent = false;

      Set<String> eventAttendees = event.getAttendees();
      for (String attendee: attendees) {
        if (eventAttendees.contains(attendee)) {
          addEvent = true;
          break;
        }
      }
      
      // add event if at least one of the attendees attend this event
      if (addEvent) {
        outOfRange.add(event.getWhen());
      }
    }

    // sort events by start time 
    Collections.sort(outOfRange, TimeRange.ORDER_BY_START);

    // iterate through and add timeranges to collection of available times
    ArrayList<TimeRange> availableTimes = new ArrayList<>();
    
    int startPointer = TimeRange.START_OF_DAY;
    for (TimeRange eventTime: outOfRange) {
      if (!eventTime.contains(startPointer) && eventTime.start() - startPointer >= request.getDuration()) {
        // create TimeRange and add to output collection
        availableTimes.add(TimeRange.fromStartEnd(startPointer, eventTime.start(), false));
      }
      // prevent startPointer from moving back due to nested events
      if (eventTime.end() > startPointer) {
        startPointer = eventTime.end();
      }
    }

    // check END_OF_DAY time slot
    if (TimeRange.END_OF_DAY - startPointer >= request.getDuration()) {
      availableTimes.add(TimeRange.fromStartEnd(startPointer, TimeRange.END_OF_DAY, true));
    }

    Collection<TimeRange> optionalTimesRequest = new ArrayList<>();
    if (request.getOptionalAttendees().size() > 0) {
      // get available times for optional attendees
      MeetingRequest requestOptionalTimes = new MeetingRequest(request.getOptionalAttendees(), request.getDuration());
      Collection<TimeRange> optionalTimes = query(events, requestOptionalTimes);

      // find timeranges where available times for mandatory and optional attendees overlap
      int j = 0;
      for (TimeRange optionalTime: optionalTimes) {
        for (int i = j; i < availableTimes.size(); i++) {
          j = i;
          TimeRange currentAvailableTime = availableTimes.get(i);

          if (optionalTime.contains(currentAvailableTime)) {
            optionalTimesRequest.add(currentAvailableTime);
          } else if (currentAvailableTime.contains(optionalTime)) {
            optionalTimesRequest.add(optionalTime);
            break; // move on to next optional time
          } else if (optionalTime.overlaps(currentAvailableTime)) {
            if (optionalTime.start() - currentAvailableTime.end() >= request.getDuration()) {
              optionalTimesRequest.add(TimeRange.fromStartEnd(optionalTime.start(), currentAvailableTime.end(), false));
            } else if (currentAvailableTime.start() - optionalTime.end() >= request.getDuration()) {
              optionalTimesRequest.add(TimeRange.fromStartEnd(currentAvailableTime.start(), optionalTime.end(), false));
              break;
            }
          } else if (optionalTime.start() > currentAvailableTime.start()) {
            break;
          }
        }
      }
    }
    
    // check which list of timeranges is to be returned
    if (optionalTimesRequest.size() > 0 || (request.getAttendees().size() == 0 && request.getOptionalAttendees().size() > 0)) {
      return optionalTimesRequest;
    } else {
      return availableTimes;
    }

  }
}
