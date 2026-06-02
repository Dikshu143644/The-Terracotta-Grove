import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, TrendingUp, DollarSign, Check, X, Shield, Plus, Trash, 
  Settings, ChefHat, HelpCircle, FileText, Smartphone, CloudRain, Sparkles, MapPin, Search
} from 'lucide-react';
import { MenuItem } from '../types';

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time?: string;
  guests: number;
  type: 'table' | 'cottage';
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  createdAt: string;
}

interface AdminPanelProps {
  onClose: () => void;
  menuItems: MenuItem[];
  onUpdateMenu: (updatedMenu: MenuItem[]) => void;
  onSetAlert: (alertText: string | null) => void;
  currentAlert: string | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, 
  menuItems, 
  onUpdateMenu, 
  onSetAlert, 
  currentAlert 
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'menu' | 'ai-insights' | 'alerts'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'table' | 'cottage' | 'pending'>('all');
  
  // Menu form states
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishCategory, setNewDishCategory] = useState<'cafe' | 'main'>('cafe');
  const [newDishIsVeg, setNewDishIsVeg] = useState(true);

  // Filter and load bookings
  useEffect(() => {
    const savedBookings = localStorage.getItem('man_reservations');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      // Seed initial dummy reservations
      const initialBookings: Booking[] = [
        {
          id: 'b1',
          name: 'Omkar Supe',
          phone: '+91 766697183',
          email: 'omkardsupe143644@gmai.com',
          date: '2026-06-03',
          time: '20:00',
          guests: 4,
          type: 'table',
          status: 'confirmed',
          notes: 'Wants authentic spicy Kolhapuri Chicken Rassa in private alcove.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'b2',
          name: 'Priyanka Patil',
          phone: '+91 9833445511',
          email: 'priyanka@gmail.com',
          date: '2026-06-06',
          guests: 2,
          type: 'cottage',
          status: 'pending',
          notes: 'Celebrating anniversary. Requests warm earthen lighting.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'b3',
          name: 'Rahul Deshmukh',
          phone: '+91 8877665544',
          email: 'rahul@deshmukh.org',
          date: '2026-06-04',
          time: '13:00',
          guests: 6,
          type: 'table',
          status: 'pending',
          notes: 'Need open-air family garden table under the mango trees.',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('man_reservations', JSON.stringify(initialBookings));
      setBookings(initialBookings);
    }
  }, []);

  // Save bookings to local storage on edit
  const saveBookingsUpdate = (updatedList: Booking[]) => {
    setBookings(updatedList);
    localStorage.setItem('man_reservations', JSON.stringify(updatedList));
  };

  // Change booking status
  const updateBookingStatus = (id: string, newStatus: 'confirmed' | 'cancelled') => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    saveBookingsUpdate(updated);
  };

  // Delete booking record
  const deleteBooking = (id: string) => {
    const updated = bookings.filter(b => b.id !== id);
    saveBookingsUpdate(updated);
  };

  // Manage menu adjustments
  const handleAddNewDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    const formattedPrice = newDishPrice.startsWith('₹') ? newDishPrice : `₹${newDishPrice}`;
    const newDish: MenuItem = {
      id: `dish-${Date.now()}`,
      name: newDishName,
      price: formattedPrice,
      description: newDishDesc,
      category: newDishCategory,
      isVeg: newDishIsVeg,
      isSpicy: newDishDesc.toLowerCase().includes('spicy') || newDishDesc.toLowerCase().includes('hot')
    };

    const updatedMenu = [...menuItems, newDish];
    onUpdateMenu(updatedMenu);
    
    // reset form
    setNewDishName('');
    setNewDishPrice('');
    setNewDishDesc('');
    setNewDishCategory('cafe');
    setNewDishIsVeg(true);
  };

  const handleRemoveDish = (dishId: string) => {
    const updatedMenu = menuItems.filter(item => item.id !== dishId);
    onUpdateMenu(updatedMenu);
  };

  const handleUpdatePrice = (dishId: string, newPriceText: string) => {
    const formattedPrice = newPriceText.startsWith('₹') ? newPriceText : `₹${newPriceText}`;
    const updatedMenu = menuItems.map(item => item.id === dishId ? { ...item, price: formattedPrice } : item);
    onUpdateMenu(updatedMenu);
  };

  // Retrieve search activity and speech questions made by visitors
  const [searchLogs, setSearchLogs] = useState<string[]>([]);
  useEffect(() => {
    const logs = localStorage.getItem('ai_concierge_logs');
    if (logs) {
      setSearchLogs(JSON.parse(logs));
    } else {
      const defaultLogs = [
        "Sunset hour spots at tiger point Lonavala",
        "Which spicy non-veg options are served on brass thali?",
        "Are cottages pet friendly?",
        "Directions from Mumbai expressway bypass",
        "Best timing for morning tea in mango garden"
      ];
      localStorage.setItem('ai_concierge_logs', JSON.stringify(defaultLogs));
      setSearchLogs(defaultLogs);
    }
  }, []);

  const clearLogs = () => {
    localStorage.removeItem('ai_concierge_logs');
    setSearchLogs([]);
  };

  // Active Alert presets
  const alertPresets = [
    "⛈️ Extreme Weather Advisory: Heavy Sahyadri showers active. Travel carefully on NH-48 exits.",
    "🍵 Monsoon Special: Complimentary Chai and Hot Podis served on arrival for all Cottage bookings!",
    "🚧 Expressway Update: Toll bypass lane active with smooth scenic routes open.",
    "❌ We are fully booked for tonight, walk-ins reopen at 8:00 AM."
  ];

  // Bookings filtering
  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'all') return true;
    if (bookingFilter === 'table') return b.type === 'table';
    if (bookingFilter === 'cottage') return b.type === 'cottage';
    if (bookingFilter === 'pending') return b.status === 'pending';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-stone-900 border-2 border-rustic-clay/50 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl relative">
        
        {/* Dashboard Title Header */}
        <div className="p-5 bg-stone-950 border-b border-stone-800 flex justify-between items-center bg-gradient-to-r from-stone-950 via-rustic-earth/20 to-stone-950">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-600/10 border border-rustic-clay flex items-center justify-center text-rustic-clay">
              <Shield size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-stone-100 font-bold tracking-wide flex items-center gap-2">
                Terracotta Operations Room 
                <span className="text-[10px] uppercase bg-rustic-clay text-stone-950 font-sans px-2.5 py-0.5 rounded font-bold">Admin Privileges</span>
              </h2>
              <p className="text-xs text-stone-400">Manage bookings, refine live menus, trigger broadcasts, & review customer AI searches.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-white bg-stone-900 p-2 border border-stone-800 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dashboard Operational Statistics Hub */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-stone-800 bg-stone-900/50">
          <div className="p-4 border-r border-stone-800 flex items-center gap-3">
            <div className="p-3 rounded bg-blue-600/10 text-blue-400"><Calendar size={20} /></div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-semibold">Total Reserve Desk</div>
              <div className="text-xl font-bold text-stone-200">{bookings.length} Guests</div>
            </div>
          </div>
          <div className="p-4 border-r border-stone-800 flex items-center gap-3">
            <div className="p-3 rounded bg-amber-600/10 text-amber-400"><Sparkles size={20} /></div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-semibold">Pending Approvals</div>
              <div className="text-xl font-bold text-rustic-gold">
                {bookings.filter(b => b.status === 'pending').length} Requests
              </div>
            </div>
          </div>
          <div className="p-4 border-r border-stone-800 flex items-center gap-3">
            <div className="p-3 rounded bg-emerald-600/10 text-emerald-400"><ChefHat size={20} /></div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-semibold">Culinary Specials</div>
              <div className="text-xl font-bold text-emerald-400">{menuItems.length} Dishes</div>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="p-3 rounded bg-orange-600/10 text-orange-400"><Search size={20} /></div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-semibold">AI Assistant Queries</div>
              <div className="text-xl font-bold text-stone-200">{searchLogs.length} Checked</div>
            </div>
          </div>
        </div>

        {/* Main layout contents */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[380px]">
          
          {/* Side Navbar */}
          <div className="w-full md:w-56 bg-stone-950 border-r border-stone-800 p-4 space-y-2 shrink-0">
            <div className="text-stone-500 text-[10px] font-bold uppercase tracking-wider mb-2 px-2">Operational Controls</div>
            
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-rustic-clay text-stone-900 font-bold' : 'text-stone-400 hover:bg-stone-900 status-hover'}`}
            >
              <Users size={16} /> Guest Reservations
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'menu' ? 'bg-rustic-clay text-stone-900 font-bold' : 'text-stone-400 hover:bg-stone-900 status-hover'}`}
            >
              <ChefHat size={16} /> Live Menu & Prices
            </button>
            <button 
              onClick={() => setActiveTab('ai-insights')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'ai-insights' ? 'bg-rustic-clay text-stone-900 font-bold' : 'text-stone-400 hover:bg-stone-900 status-hover'}`}
            >
              <FileText size={16} /> Guest AI Queries
            </button>
            <button 
              onClick={() => setActiveTab('alerts')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-rustic-clay text-stone-900 font-bold' : 'text-stone-400 hover:bg-stone-900 status-hover'}`}
            >
              <Settings size={16} /> Broadcast & Alerts
            </button>

            {/* Simulated Live Alert Banner info */}
            <div className="pt-8 text-center bg-stone-950/20 rounded p-3 border border-stone-900 text-xs">
              <span className="text-stone-500 block text-[10px]">CURRENT BROADCAST ALERT</span>
              <p className="text-stone-400 italic text-[11px] mt-1 line-clamp-2">
                {currentAlert || "No alerts currently shown on the header."}
              </p>
            </div>
          </div>

          {/* Core Panel Display area */}
          <div className="flex-1 p-6 overflow-y-auto bg-stone-900/30">
            
            {/* TAB 1: RESERVATIONS MANAGER */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-serif text-stone-200 font-bold">Resort Stays & Dining Bookings</h3>
                  
                  {/* Reservation filters */}
                  <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs gap-1">
                    {['all', 'table', 'cottage', 'pending'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setBookingFilter(f as any)}
                        className={`px-3 py-1.5 rounded capitalize ${bookingFilter === f ? 'bg-rustic-earth text-stone-200 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="p-12 text-center bg-stone-950/50 rounded-lg border border-stone-800 text-stone-500">
                    <Calendar className="mx-auto mb-2 text-stone-700" size={32} />
                    <p>No reservations found matching active selection.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => (
                      <div 
                        key={b.id}
                        className={`p-4 bg-stone-950 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${
                          b.status === 'confirmed' ? 'border-emerald-900/50 bg-stone-950/70' : b.status === 'cancelled' ? 'border-red-950/40 opacity-70' : 'border-stone-800'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-200 text-base">{b.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${
                              b.type === 'cottage' ? 'bg-amber-600/10 text-amber-400 border border-amber-900/50' : 'bg-blue-600/10 text-blue-400 border border-blue-950'
                            }`}>
                              🏡 {b.type} stay
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${
                              b.status === 'confirmed' ? 'bg-emerald-600/10 text-emerald-400' : b.status === 'cancelled' ? 'bg-red-600/10 text-red-400' : 'bg-amber-500/10 text-rustic-gold'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-stone-400">
                            <div>📞 <span className="text-stone-300 ml-1">{b.phone}</span></div>
                            <div>✉️ <span className="text-stone-300 ml-1">{b.email}</span></div>
                            <div>📅 <span className="text-stone-300 ml-1">{b.date} {b.time ? `@ ${b.time}` : ''}</span></div>
                            <div>👥 <span className="text-stone-300 ml-1">{b.guests} Guests</span></div>
                          </div>

                          {b.notes && (
                            <p className="text-xs text-stone-500 italic bg-stone-900/40 p-2 rounded border border-stone-900 mt-1 max-w-3xl">
                              " {b.notes} "
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end md:self-center">
                          {b.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-stone-950 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Check size={14} strokeWidth={3} /> Approve
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                className="h-8 px-3 bg-stone-900 hover:bg-red-950/40 text-stone-400 border border-stone-800 rounded text-xs font-bold flex items-center gap-1 transition-colors hover:text-red-400"
                              >
                                <X size={14} /> Decline
                              </button>
                            </>
                          )}

                          {b.status === 'confirmed' && (
                            <a 
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(b.name)},%20this%20is%20The%20Terracotta%20Grove%20reception.%20Your%20reservation%20for%20${b.date}%20is%20officially%20CONFIRMED!`}
                              target="_blank"
                              rel="noreferrer"
                              className="h-8 px-3 bg-green-600/10 hover:bg-green-600 text-green-400 hover:text-white border border-green-800 rounded text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Smartphone size={12} /> WhatsApp Guest
                            </a>
                          )}

                          <button 
                            onClick={() => deleteBooking(b.id)}
                            className="h-8 w-8 bg-stone-900 hover:bg-red-900/20 text-stone-500 hover:text-red-500 border border-stone-800 hover:border-red-900/50 rounded flex items-center justify-center transition-colors"
                            title="Delete Record"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MENU & PRICING MANAGER */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-stone-200 font-bold mb-1">Live Menu Adjustments</h3>
                  <p className="text-xs text-stone-400">Add custom specialties, adapt prices dynamically, and categorize dishes immediately.</p>
                </div>

                {/* Subgrid: Add dish form vs list */}
                <div className="grid lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Create new Dish Form */}
                  <div className="bg-stone-950 p-4 border border-stone-800 rounded-lg self-start">
                    <h4 className="text-xs uppercase font-semibold text-rustic-gold mb-3 flex items-center gap-1">
                      <Plus size={14} /> Register New Dish
                    </h4>
                    
                    <form onSubmit={handleAddNewDish} className="space-y-3.5 text-xs">
                      <div>
                        <label className="text-stone-400 block mb-1">Dish Name</label>
                        <input 
                          type="text" 
                          required
                          value={newDishName} 
                          onChange={(e) => setNewDishName(e.target.value)} 
                          placeholder="e.g. Kolhapuri Mutton Thali" 
                          className="w-full bg-stone-900 border border-stone-800 p-2.5 rounded text-white focus:border-rustic-clay focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-stone-400 block mb-1">Price (₹)</label>
                          <input 
                            type="text" 
                            required
                            value={newDishPrice} 
                            onChange={(e) => setNewDishPrice(e.target.value)} 
                            placeholder="e.g. 320" 
                            className="w-full bg-stone-900 border border-stone-800 p-2.5 rounded text-white focus:border-rustic-clay focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-stone-400 block mb-1">Catalog Section</label>
                          <select 
                            value={newDishCategory} 
                            onChange={(e) => setNewDishCategory(e.target.value as any)}
                            className="w-full bg-stone-900 border border-stone-800 p-2.5 rounded text-stone-200 focus:outline-none"
                          >
                            <option value="cafe">☕ Cafe Special</option>
                            <option value="main">🍛 Main Course</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-stone-400 block mb-1">Short Description</label>
                        <textarea 
                          value={newDishDesc} 
                          onChange={(e) => setNewDishDesc(e.target.value)} 
                          placeholder="Freshly ground hand-pounded masalas..." 
                          className="w-full bg-stone-900 border border-stone-800 p-2 rounded text-white focus:border-rustic-clay focus:outline-none h-20"
                        />
                      </div>

                      <div className="flex gap-4 items-center pt-1.5">
                        <label className="flex items-center gap-1.5 text-stone-300">
                          <input 
                            type="checkbox" 
                            checked={newDishIsVeg} 
                            onChange={(e) => setNewDishIsVeg(e.target.checked)}
                            className="rounded bg-stone-900 border-stone-800 text-rustic-clay"
                          />
                          Pure Vegetarian
                        </label>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-rustic-clay text-stone-950 font-bold rounded-sm hover:bg-orange-500 transition-colors uppercase mt-2 flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} strokeWidth={3} /> Inject into Live Menu
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Existing Menu list and direct price editing */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs uppercase font-semibold text-stone-500 tracking-wider">Active Culinary Register</h4>
                    
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
                      {menuItems.map((item) => (
                        <div key={item.id || item.name} className="bg-stone-950 p-3 rounded-lg border border-stone-800 flex justify-between items-center text-xs gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <strong className="text-stone-100 text-sm font-semibold">{item.name}</strong>
                              <span className="text-[10px] text-stone-500 capitalize bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                              {item.isSpicy && <span className="text-[10px] bg-red-950/50 text-red-400 border border-red-900/30 px-1.5 rounded font-bold">Spicy🌶️</span>}
                            </div>
                            <p className="text-stone-500 text-[11px] max-w-sm shrink-line line-clamp-1">{item.description || item.desc}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-stone-900 border border-stone-800 rounded overflow-hidden">
                              <span className="bg-stone-800 text-stone-400 px-2 text-[10px] font-bold py-1.5">₹</span>
                              <input 
                                type="text"
                                defaultValue={item.price.replace('₹', '')}
                                onBlur={(e) => handleUpdatePrice(item.id, e.target.value)}
                                className="w-16 bg-stone-900 text-stone-100 px-1 py-1 text-center font-bold font-mono focus:outline-none"
                              />
                            </div>

                            <button 
                              onClick={() => handleRemoveDish(item.id)}
                              className="text-stone-600 hover:text-red-500 hover:bg-stone-900 p-1.5 rounded transition-all"
                              title="Delete Item"
                            >
                              <Trash size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: AI INSIGHTS & GUEST SEARCH MONITOR */}
            {activeTab === 'ai-insights' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-serif text-stone-200 font-bold mb-1">Live Guest AI Queries log</h3>
                    <p className="text-xs text-stone-400">Review real-time search strings submitted by travelers on the concierge platform.</p>
                  </div>
                  <button 
                    onClick={clearLogs}
                    className="text-stone-500 hover:text-stone-200 text-xs px-2.5 py-1 bg-stone-950 border border-stone-800 rounded transition"
                  >
                    Clear Analytics
                  </button>
                </div>

                {searchLogs.length === 0 ? (
                  <div className="p-12 text-center bg-stone-950/50 rounded border border-stone-800 text-stone-500">
                    <HelpCircle className="mx-auto mb-2 text-stone-700 font-bold" size={32} />
                    <p>No recent traveler searches logged yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-stone-950 border border-stone-800 rounded text-xs flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-stone-900 text-stone-500 border border-stone-800 flex items-center justify-center font-mono text-[9px]">
                            {index + 1}
                          </span>
                          <span className="text-stone-300 font-medium italic">"{log}"</span>
                        </div>
                        <span className="text-[10px] text-stone-600 bg-stone-900 px-2 py-0.5 rounded font-mono group-hover:text-stone-400 transition-colors">
                          Recently asked
                        </span>
                      </div>
                    ))}
                    <div className="p-3.5 bg-rustic-clay/10 border border-rustic-clay/30 rounded text-xs text-amber-500/90 leading-relaxed max-w-2xl">
                      💡 <strong>Operator Tip:</strong> 3 guests recently queried sunset peaks and road assistance coordinates. Consider triggering a custom weather notification using the "Broadcasts" tab.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ALERTS BOARD */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-stone-200 font-bold mb-1">Header Broadcast Center</h3>
                  <p className="text-xs text-stone-400">Push immediate alerts, monsoon deals, or safety banners to the top of the webpage.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Preset selections */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-semibold text-stone-500 tracking-wider">Fast-Cast Presets</h4>
                    <div className="space-y-2.5">
                      {alertPresets.map((preset, idx) => (
                        <button 
                          key={idx}
                          onClick={() => onSetAlert(preset)}
                          className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-all ${
                            currentAlert === preset 
                              ? 'bg-amber-600/10 border-amber-500 text-amber-300 font-semibold' 
                              : 'bg-stone-950 hover:bg-stone-950/70 text-stone-400 border-stone-800'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom broadcast trigger */}
                  <div className="bg-stone-950 p-5 rounded-lg border border-stone-800 self-start space-y-4">
                    <h4 className="text-xs uppercase font-semibold text-rustic-gold">Draft Custom Broadcast</h4>
                    
                    <div className="space-y-3">
                      <textarea 
                        placeholder="Type custom text alert (e.g. Complimentary coffee hours extended until 9:00 PM tonight!)"
                        className="w-full h-24 bg-stone-900 border border-stone-850 rounded p-3 text-xs text-stone-200 focus:border-rustic-clay focus:outline-none"
                        id="customAlertTextArea"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const val = (document.getElementById('customAlertTextArea') as HTMLTextAreaElement)?.value;
                            if (val && val.trim()) {
                              onSetAlert(val.trim());
                              (document.getElementById('customAlertTextArea') as HTMLTextAreaElement).value = '';
                            }
                          }}
                          className="flex-1 bg-rustic-clay hover:bg-orange-600 text-stone-950 py-2.5 text-xs font-bold rounded uppercase transition-colors"
                        >
                          ⚠️ Air BroadCast Alert
                        </button>
                        
                        {currentAlert && (
                          <button 
                            onClick={() => onSetAlert(null)}
                            className="px-4 border border-red-900 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white rounded text-xs font-bold transition-all"
                          >
                            Disable Active
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
