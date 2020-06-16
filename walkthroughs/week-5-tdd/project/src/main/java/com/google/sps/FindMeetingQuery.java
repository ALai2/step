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
      Set<String> eventAttendees = event.getAttendees();
      for (String attendee: attendees) {
        if (eventAttendees.contains(attendee)) {
          outOfRange.add(event.getWhen());
          break;
        }
      }
    }

    // sort events by start time 
    Collections.sort(outOfRange, TimeRange.ORDER_BY_START);

    // iterate through and add timeranges to collection of available times
    Collection<TimeRange> availableTimes = new ArrayList<>();
    
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

    return availableTimes;
  }
}
