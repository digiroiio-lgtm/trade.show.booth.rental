"use client";

import { useMemo, useState } from "react";
import type { ReferenceCity, ReferenceEvent } from "@/lib/rfqTypes";

interface EventSelectProps {
  events: ReferenceEvent[];
  cities: ReferenceCity[];
  eventId: string | null;
  eventUnknown: boolean;
  eventNameFreeText: string;
  citySlug: string;
  onChange: (patch: {
    eventId?: string | null;
    eventUnknown?: boolean;
    eventNameFreeText?: string;
    citySlug?: string;
  }) => void;
}

export default function EventSelect({
  events,
  cities,
  eventId,
  eventUnknown,
  eventNameFreeText,
  citySlug,
  onChange,
}: EventSelectProps) {
  const [query, setQuery] = useState("");
  const [notListed, setNotListed] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!query.trim()) return events;
    const q = query.toLowerCase();
    return events.filter((event) => event.name.toLowerCase().includes(q));
  }, [events, query]);

  const selectedEvent = events.find((event) => event.id === eventId);

  if (eventUnknown) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          No problem — we&apos;ll help you figure out your booking once we know
          more about your project.
        </p>
        <button
          type="button"
          className="text-sm font-medium text-slate-900 underline underline-offset-2"
          onClick={() => onChange({ eventUnknown: false })}
        >
          Actually, I do know my event
        </button>
      </div>
    );
  }

  if (notListed) {
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Event name
          </label>
          <input
            type="text"
            className="input"
            value={eventNameFreeText}
            onChange={(e) => onChange({ eventNameFreeText: e.target.value, eventId: null })}
            placeholder="e.g. Regional Industry Expo"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
          <select
            className="input"
            value={citySlug}
            onChange={(e) => onChange({ citySlug: e.target.value })}
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-slate-900 underline underline-offset-2"
          onClick={() => setNotListed(false)}
        >
          Search events instead
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        className="input"
        value={selectedEvent ? selectedEvent.name : query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange({ eventId: null });
        }}
        placeholder="Search trade shows (e.g. CES)"
      />
      {query.trim().length > 0 && !selectedEvent && (
        <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
          {filteredEvents.length === 0 && (
            <li className="px-3 py-3 text-sm text-slate-500">No matching events</li>
          )}
          {filteredEvents.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                className="block w-full px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setQuery("");
                  onChange({
                    eventId: event.id,
                    citySlug: event.citySlug ?? citySlug,
                  });
                }}
              >
                {event.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-4 text-sm">
        <button
          type="button"
          className="font-medium text-slate-900 underline underline-offset-2"
          onClick={() => onChange({ eventUnknown: true, eventId: null })}
        >
          I don&apos;t know yet
        </button>
        <button
          type="button"
          className="font-medium text-slate-900 underline underline-offset-2"
          onClick={() => setNotListed(true)}
        >
          My event isn&apos;t listed
        </button>
      </div>
    </div>
  );
}
