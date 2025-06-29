import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import importedData from "../Data/data.json";

const CalenderApp = () => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthsOfYear = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentDate = new Date();

  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setselectedDate] = useState(currentDate);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventTime, setEventTime] = useState({
    hours: '00',
    minutes: '00',
    endHours: '00',
    endMinutes: '00'
  });
  const [eventText, setEventText] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  useEffect(() => {
    const preloadedEvents = importedData.map((item, index) => ({
      id: Date.now() + index,
      date: new Date(item.date),
      time: item.startTime,
      endTime: item.endTime,
      text: item.title,
      color: item.Color
    }));
    setEvents(preloadedEvents);
  }, []);

  const prevMonth = () => {
    setCurrentMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth - 1));
    setCurrentYear(prevYear => (currentMonth === 0 ? prevYear - 1 : prevYear));
  };

  const nextMonth = () => {
    setCurrentMonth(prevMonth => (prevMonth === 11 ? 0 : prevMonth + 1));
    setCurrentYear(prevYear => (currentMonth === 11 ? prevYear + 1 : prevYear));
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const today = new Date();
    if (clickedDate >= today || isSameDay(clickedDate, today)) {
      setselectedDate(clickedDate);
      setShowEventPopup(true);
      setEventTime({
        hours: '00',
        minutes: '00',
        endHours: '00',
        endMinutes: '00'
      });
      setEventText('');
      setEditingEvent(null);
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleEventSubmit = () => {
    const start = `${eventTime.hours.padStart(2, '0')}:${eventTime.minutes.padStart(2, '0')}`;
    const end = `${eventTime.endHours.padStart(2, '0')}:${eventTime.endMinutes.padStart(2, '0')}`;

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate,
      time: start,
      endTime: end,
      text: eventText,
      color: "#e04b4b",
    };

    const isConflict = events.some(event => {
      return (
        event.id !== editingEvent?.id &&
        isSameDay(event.date, newEvent.date) &&
        event.time === newEvent.time
      );
    });

    if (isConflict) {
      toast.warn("Conflict: Another event is scheduled at the same time!");
      return;
    }

    let updatedEvents = [...events];
    if (editingEvent) {
      updatedEvents = updatedEvents.map((event) =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents.push(newEvent);
    }

    updatedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    setEvents(updatedEvents);
    setEventTime({
      hours: '00',
      minutes: '00',
      endHours: '00',
      endMinutes: '00'
    });
    setEventText('');
    setShowEventPopup(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event) => {
    setselectedDate(new Date(event.date));
    setEventTime({
      hours: event.time.split(':')[0],
      minutes: event.time.split(':')[1],
      endHours: event.endTime?.split(':')[0] || '00',
      endMinutes: event.endTime?.split(':')[1] || '00',
    });
    setEventText(event.text);
    setEditingEvent(event);
    setShowEventPopup(true);
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setEventTime((prevTime) => ({
      ...prevTime,
      [name]: value.padStart(2, '0')
    }));
  };

  return (
    <div className="calendar-app">
      <div className="calendar">
        <h1 className="heading">Calendar</h1>
        <div className="navigate-date">
          <h2 className="month">{monthsOfYear[currentMonth]},</h2>
          <h2 className="year">{currentYear}</h2>
          <div className="buttons">
            <i className="bx bx-chevron-left" onClick={prevMonth}></i>
            <i className="bx bx-chevron-right" onClick={nextMonth}></i>
          </div>
        </div>
        <div className="weekdays">
          {daysOfWeek.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="days">
          {[...Array(firstDayOfMonth).keys()].map((_, index) => (
            <span key={`empty-${index}`} />
          ))}
          {[...Array(daysInMonth).keys()].map((day) => (
            <span
              key={day + 1}
              className={
                day + 1 === currentDate.getDate() &&
                currentMonth === currentDate.getMonth() &&
                currentYear === currentDate.getFullYear()
                  ? 'current-day'
                  : ''
              }
              onClick={() => handleDayClick(day + 1)}
            >
              {day + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="events">
        {showEventPopup && (
          <div className="event-popup">
            <div className="time-input">
              <div className="event-popup-time">Start Time</div>
              <input
                type="number"
                name="hours"
                min={0}
                max={23}
                className="hours"
                value={eventTime.hours}
                onChange={handleTimeChange}
              />
              <input
                type="number"
                name="minutes"
                min={0}
                max={59}
                className="minutes"
                value={eventTime.minutes}
                onChange={handleTimeChange}
              />
            </div>

            <div className="time-input">
              <div className="event-popup-time">End Time</div>
              <input
                type="number"
                name="endHours"
                min={0}
                max={23}
                className="hours"
                value={eventTime.endHours}
                onChange={handleTimeChange}
              />
              <input
                type="number"
                name="endMinutes"
                min={0}
                max={59}
                className="minutes"
                value={eventTime.endMinutes}
                onChange={handleTimeChange}
              />
            </div>

            <textarea
              placeholder="Enter Event Text(Maximum 60 Characters)"
              value={eventText}
              onChange={(e) => {
                if (e.target.value.length <= 60) {
                  setEventText(e.target.value);
                }
              }}
            ></textarea>
            <button className="event-popup-btn" onClick={handleEventSubmit}>
              {editingEvent ? "Update Event" : "Add Event"}
            </button>
            <button className="close-event-popup" onClick={() => setShowEventPopup(false)}>
              <i className="bx bx-x"></i>
            </button>
          </div>
        )}

        {events.map((event, index) => (
          <div
            className="event"
            key={index}
            style={{ borderLeft: `6px solid ${event.color || "#ccc"}` }}
          >
            <div className="event-date-wrapper">
              <div className="event-date">
                {`${monthsOfYear[event.date.getMonth()]} ${event.date.getDate()}, ${event.date.getFullYear()}`}
              </div>
              <div className="event-time">
                {event.time} {event.endTime ? `- ${event.endTime}` : ""}
              </div>
            </div>
            <div className="event-text">{event.text}</div>
            <div className="event-buttons">
              <i className="bx bxs-edit-alt" onClick={() => handleEditEvent(event)}></i>
              <i className="bx bx-x" onClick={() => handleDeleteEvent(event.id)}></i>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CalenderApp;
