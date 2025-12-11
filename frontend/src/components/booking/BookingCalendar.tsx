import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Video } from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface BookingCalendarProps {
  counselorId: string;
  onBookingComplete: (bookingId: string) => void;
}

export function BookingCalendar({ counselorId, onBookingComplete }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [meetingType, setMeetingType] = useState<'in-person' | 'online'>('online');
  const [notes, setNotes] = useState('');

  // Sample time slots - in real app, fetch from backend
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00 AM', available: true },
    { id: '2', time: '10:00 AM', available: false },
    { id: '3', time: '11:00 AM', available: true },
    { id: '4', time: '02:00 PM', available: true },
    { id: '5', time: '03:00 PM', available: true },
    { id: '6', time: '04:00 PM', available: false },
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    try {
      // API call to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counselorId,
          date: selectedDate.toISOString(),
          timeSlot: selectedSlot.time,
          meetingType,
          notes,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onBookingComplete(data.bookingId);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CalendarIcon className="w-6 h-6 text-blue-600" />
        Schedule Your Session
      </h2>

      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Date</label>
        <input
          type="date"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Available Time Slots</label>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  slot.available
                    ? selectedSlot?.id === slot.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Meeting Type</label>
        <div className="flex gap-4">
          <button
            onClick={() => setMeetingType('online')}
            className={`flex-1 p-3 rounded-lg border-2 ${
              meetingType === 'online'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300'
            }`}
          >
            <Video className="w-5 h-5 inline mr-2" />
            Online
          </button>
          <button
            onClick={() => setMeetingType('in-person')}
            className={`flex-1 p-3 rounded-lg border-2 ${
              meetingType === 'in-person'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300'
            }`}
          >
            <MapPin className="w-5 h-5 inline mr-2" />
            In Person
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific topics or concerns you'd like to discuss..."
        />
      </div>

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={!selectedDate || !selectedSlot}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Confirm Booking
      </button>
    </div>
  );
}
