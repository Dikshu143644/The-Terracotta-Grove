import React, { useState } from 'react';
import { Calendar, Users, X, Clock, HelpCircle, User, Phone, Mail, Sparkles, CheckCircle, Leaf } from 'lucide-react';

interface BookingModalProps {
  onClose: () => void;
  initialType?: 'table' | 'cottage';
}

const BookingModal: React.FC<BookingModalProps> = ({ onClose, initialType = 'table' }) => {
  const [bookingType, setBookingType] = useState<'table' | 'cottage'>(initialType);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !date) return;

    // Create reservation payload
    const newReservation = {
      id: `b-${Date.now().toString(36)}`,
      name,
      phone,
      email,
      date,
      time: bookingType === 'table' ? time : undefined,
      guests,
      type: bookingType,
      status: 'pending',
      notes,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const existing = localStorage.getItem('man_reservations');
      const bookingsList = existing ? JSON.parse(existing) : [];
      bookingsList.unshift(newReservation);
      localStorage.setItem('man_reservations', JSON.stringify(bookingsList));
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-rustic-earth rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        
        {/* Header content */}
        <div className="p-4 bg-stone-800 border-b border-stone-700 flex justify-between items-center bg-gradient-to-r from-stone-800 via-rustic-earth/20 to-stone-800">
          <h2 className="text-xl font-serif text-rustic-clay flex items-center gap-2 font-bold select-none">
            <Leaf size={18} className="text-rustic-gold animate-bounce" /> 
            {bookingType === 'table' ? 'Reserve a Dining Alcove' : 'Cottage Booking Inquiry'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white bg-stone-900/50 p-1.5 rounded transition">
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Toggle switcher */}
              <div className="grid grid-cols-2 bg-stone-950 p-1.5 rounded-lg border border-stone-800">
                <button
                  type="button"
                  onClick={() => setBookingType('table')}
                  className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    bookingType === 'table' 
                      ? 'bg-rustic-clay text-stone-950 font-black shadow' 
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  🍽️ Reserve Table
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('cottage')}
                  className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    bookingType === 'cottage' 
                      ? 'bg-rustic-clay text-stone-950 font-black shadow' 
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  🏡 Cottage Suite
                </button>
              </div>

              {/* Guest Information name, phone, email */}
              <div className="space-y-3">
                <div>
                  <label className="block text-stone-400 text-xs font-bold mb-1 ml-0.5">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-stone-500" size={16} />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Omkar Supe"
                      className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 pl-10 text-white focus:border-rustic-clay focus:outline-none col-span-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 text-xs font-bold mb-1 ml-0.5">WhatsApp Mobile</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-stone-500" size={16} />
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 766697183"
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 pl-10 text-white focus:border-rustic-clay focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-stone-400 text-xs font-bold mb-1 ml-0.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-stone-500" size={16} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="omkardsupe143644@gmai.com"
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 pl-10 text-white focus:border-rustic-clay focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-stone-400 text-xs font-bold mb-1 ml-0.5">Target Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-stone-500" size={16} />
                      <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 pl-10 text-stone-200 focus:border-rustic-clay focus:outline-none text-sm cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {bookingType === 'table' ? (
                    <div>
                      <label className="block text-stone-400 text-xs font-bold mb-1 ml-0.5">Time Slot</label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-3 text-stone-500" size={15} />
                        <input 
                          type="time" 
                          required
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 pl-8 text-stone-200 focus:border-rustic-clay focus:outline-none text-sm cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-stone-400 text-xs font-bold mb-1 ml-0.5">Total Guests</label>
                      <div className="relative">
                        <Users className="absolute left-2.5 top-3 text-stone-500" size={15} />
                        <input 
                          type="number" 
                          min={1} 
                          max={20}
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 pl-8 text-white focus:border-rustic-clay focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {bookingType === 'table' && (
                  <div>
                    <label className="block text-stone-400 text-xs font-bold mb-1 ml-0.5">Dining Table Size</label>
                    <div className="flex gap-2">
                      {[2, 4, 6, 8].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setGuests(num)}
                          className={`flex-1 py-1.5 rounded border text-xs font-semibold ${
                            guests === num 
                              ? 'bg-amber-600/20 border-rustic-clay text-rustic-clay font-bold' 
                              : 'bg-stone-950 border-stone-700 text-stone-400'
                          }`}
                        >
                          {num} {num === 8 ? '8+ Guests' : `Guests`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional description/notes */}
                <div>
                  <label className="block text-stone-400 text-xs font-bold mb-1 ml-0.5">Dietary Preference or Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={bookingType === 'table' ? "Specify spice levels, private alcove, high chairs, pure veg preferences..." : "Anniversary flower setups, vintage lantern requests, child accommodation, travel distance details..."}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-3 text-stone-200 focus:border-rustic-clay focus:outline-none h-20 text-xs"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-100 font-bold rounded-lg shadow-lg shadow-orange-500/20 transition-all uppercase tracking-wide text-xs"
              >
                Send reservation lookup request
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
              <div className="mx-auto w-16 h-16 bg-emerald-600/10 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 animate-pulse">
                <CheckCircle size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-stone-100">Request Dispatched!</h3>
                <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
                  Your {bookingType} booking query is submitted. Our cottage stewards are verifying spacing capacity for <span className="text-rustic-gold font-semibold">{date}</span>.
                </p>
              </div>
              <div className="bg-stone-950 p-4 border border-stone-850 rounded-lg text-left text-xs space-y-1.5 max-w-sm mx-auto">
                <div className="text-stone-500 uppercase text-[10px] tracking-wider font-semibold">PRE-BOOKING FEED</div>
                <div className="text-stone-300">👋 Welcome steward: <span className="font-bold">{name}</span></div>
                <div className="text-stone-300">🎫 Target space: <span className="capitalize">{bookingType} confirmation</span></div>
                <div className="text-[10px] text-rustic-clay italic mt-1">Our concierges are preparing your table directions. Follow the GPS Live Tracker below.</div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button 
                  onClick={onClose} 
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-bold text-xs"
                >
                  Return to Resort Lobby
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookingModal;
