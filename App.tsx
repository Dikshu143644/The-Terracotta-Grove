import React, { useState, useEffect } from 'react';
import { 
  Menu, MapPin, Coffee, Utensils, BedDouble, Camera, Play, Moon, Sun, 
  Wand2, Search, Lock, Shield, X, HelpCircle, Key, CheckCircle, ExternalLink
} from 'lucide-react';
import VoiceConcierge from './components/VoiceConcierge';
import VeoModal from './components/VeoModal';
import ImageEditorModal from './components/ImageEditorModal';
import SearchModal from './components/SearchModal';
import ResortMap from './components/ResortMap';
import AdminPanel from './components/AdminPanel';
import BookingModal from './components/BookingModal';
import { MenuItem } from './types';

const defaultMenu: MenuItem[] = [
  { id: 'm1', name: "Masala Chai", price: "₹40", desc: "Served in earthen kullad", type: "cafe", category: "cafe", isVeg: true, description: "Served in earthen kullad" },
  { id: 'm2', name: "Bun Maska", price: "₹60", desc: "Fresh baked with homemade butter", type: "cafe", category: "cafe", isVeg: true, description: "Fresh baked with homemade butter" },
  { id: 'm3', name: "Misal Pav", price: "₹120", desc: "Spicy sprouted moth bean curry", type: "main", category: "main", isVeg: true, isSpicy: true, description: "Spicy sprouted moth bean curry" },
  { id: 'm4', name: "Chicken Rassa", price: "₹280", desc: "Kolhapuri style spicy curry", type: "main", category: "main", isVeg: false, isSpicy: true, description: "Kolhapuri style spicy curry" },
  { id: 'm5', name: "Bhakri Thali", price: "₹220", desc: "Jowar roti with pitla & thecha", type: "main", category: "main", isVeg: true, description: "Jowar roti with pitla & thecha" },
];

const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'veo' | 'edit' | 'search' | null>(null);

  // Core Dynamic States
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('man_menu_items');
      return saved ? JSON.parse(saved) : defaultMenu;
    } catch (e) {
      return defaultMenu;
    }
  });

  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(() => {
    return localStorage.getItem('man_broadcast_alert') || null;
  });

  // Client booking states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalType, setBookingModalType] = useState<'table' | 'cottage'>('table');

  // Admin Verification States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('man_admin_active') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Login input fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleUpdateMenu = (newMenu: MenuItem[]) => {
    setMenuItems(newMenu);
    localStorage.setItem('man_menu_items', JSON.stringify(newMenu));
  };

  const handleUpdateAlert = (text: string | null) => {
    setBroadcastAlert(text);
    if (text) {
      localStorage.setItem('man_broadcast_alert', text);
    } else {
      localStorage.removeItem('man_broadcast_alert');
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetEmail = 'omkardsupe143644@gmai.com';
    const targetPassword = 'Dikshu@143644*';

    if (loginEmail.trim() === targetEmail && loginPassword === targetPassword) {
      setIsAdmin(true);
      localStorage.setItem('man_admin_active', 'true');
      setShowLoginModal(false);
      setShowAdminPanel(true); // Open admin control desk immediately upon successful login!
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid administrator credentials. Access Denied.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('man_admin_active');
    setShowAdminPanel(false);
  };

  const toggleModal = (modal: 'veo' | 'edit' | 'search' | null) => {
    setActiveModal(modal);
  };

  const openBooking = (type: 'table' | 'cottage') => {
    setBookingModalType(type);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 selection:bg-rustic-clay selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-rustic-clay tracking-wider select-none">The Terracotta Grove</h1>
          <div className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide text-stone-300 items-center">
            <a href="#about" className="hover:text-rustic-clay transition-colors">OUR STORY</a>
            <a href="#menu" className="hover:text-rustic-clay transition-colors">MENU</a>
            <a href="#stay" className="hover:text-rustic-clay transition-colors">STAY</a>
            <a href="#gallery" className="hover:text-rustic-clay transition-colors">GALLERY</a>
            {isAdmin && (
              <button 
                onClick={() => setShowAdminPanel(true)} 
                className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 transition-colors uppercase text-[11px]"
              >
                <Shield size={14} /> Ops Desk
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={handleAdminLogout}
                className="text-[10px] text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-950/20 px-2 py-1 rounded transition-colors"
              >
                Logout Staff
              </button>
            )}
            <button 
              className="md:hidden text-rustic-clay"
              onClick={() => openBooking('table')}
            >
              <Menu />
            </button>
          </div>
        </div>

        {/* Dynamic Header Broadcast alerts from Admin panel */}
        {broadcastAlert && (
          <div className="bg-gradient-to-r from-amber-600 to-orange-400 text-stone-950 text-xs font-bold py-2.5 px-6 flex justify-between items-center z-50 shadow-lg border-t border-amber-500/20">
            <div className="flex items-center gap-2 max-w-[85%]">
              <span className="h-2 w-2 rounded-full bg-red-650 animate-ping shrink-0" />
              <span className="font-semibold">{broadcastAlert}</span>
            </div>
            <button 
              onClick={() => handleUpdateAlert(null)}
              className="text-stone-950 hover:text-stone-100 p-0.5 focus:outline-none"
              title="Close Broadcast"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            alt="Rustic Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/60"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <p className="text-rustic-clay text-lg md:text-xl font-bold tracking-[0.2em] mb-4">EAT • RELAX • STAY</p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-100 mb-8 leading-tight">
            A Soulful Escape <br/> <span className="text-rustic-gold italic">in the Sahyadris</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button 
               onClick={() => openBooking('table')}
               className="px-8 py-4 bg-rustic-clay text-stone-900 font-bold rounded-sm hover:bg-orange-600 transition-all transform hover:-translate-y-1 shadow-[0_4px_14px_0_rgba(224,122,95,0.39)]"
             >
              BOOK A TABLE
            </button>
            <button 
              onClick={() => toggleModal('search')}
              className="px-8 py-4 border border-stone-500 text-stone-300 font-bold rounded-sm hover:border-rustic-clay hover:text-rustic-clay transition-all flex items-center justify-center gap-2"
            >
              <Search size={18} /> PLAN YOUR TRIP
            </button>
          </div>
        </div>
      </section>

      {/* AI Features Highlight Bar */}
      <section className="bg-stone-900 border-y border-stone-800 py-6">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6">
          <button onClick={() => toggleModal('veo')} className="flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-rustic-clay transition-colors">
            <Play size={16} /> CREATE VIDEO MEMORY
          </button>
          <span className="text-stone-700 hidden sm:inline">|</span>
          <button onClick={() => toggleModal('edit')} className="flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-rustic-clay transition-colors">
            <Wand2 size={16} /> MAGIC PHOTO EDITOR
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-stone-950">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-serif text-rustic-clay">More Than Just a Halt</h2>
            <p className="text-stone-400 leading-relaxed text-lg">
              Nestled off the highway, we are a sanctuary for weary travelers and weekend seekers. 
              Built with reclaimed wood and local stone, our space respects the earth it stands on.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-rustic-leaf"></span>
                <div>
                  <strong className="text-stone-200 block">The Couple's Alcove</strong>
                  <span className="text-stone-500 text-sm">Dimly lit, private corners for intimate conversations.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-rustic-clay"></span>
                <div>
                  <strong className="text-stone-200 block">The Family Garden</strong>
                  <span className="text-stone-500 text-sm">Open-air seating under mango trees with a play area.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://picsum.photos/400/500?random=1" className="rounded-lg opacity-80 hover:opacity-100 transition-opacity" alt="Vibe 1" />
            <img src="https://picsum.photos/400/500?random=2" className="rounded-lg opacity-80 hover:opacity-100 transition-opacity mt-8" alt="Vibe 2" />
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 bg-stone-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-rustic-clay mb-4">Farm to Fork</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">Authentic Maharashtrian spices ground daily in our kitchen.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Cafe */}
            <div>
              <h3 className="text-2xl font-serif text-rustic-gold mb-6 flex items-center gap-2">
                <Coffee size={24} /> Cafe Specials
              </h3>
              <div className="space-y-8">
                {menuItems.filter(i => i.type === 'cafe').map((item, idx) => (
                  <div key={idx} className="flex justify-between items-baseline border-b border-stone-800 pb-2">
                    <div>
                      <h4 className="text-lg font-bold text-stone-200">{item.name}</h4>
                      <p className="text-sm text-stone-500">{item.desc}</p>
                    </div>
                    <span className="text-rustic-clay font-bold">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main */}
            <div>
              <h3 className="text-2xl font-serif text-rustic-gold mb-6 flex items-center gap-2">
                <Utensils size={24} /> The Main Course
              </h3>
              <div className="space-y-8">
                {menuItems.filter(i => i.type === 'main').map((item, idx) => (
                  <div key={idx} className="flex justify-between items-baseline border-b border-stone-800 pb-2">
                    <div>
                      <h4 className="text-lg font-bold text-stone-200">{item.name}</h4>
                      <p className="text-sm text-stone-500">{item.desc}</p>
                    </div>
                    <span className="text-rustic-clay font-bold">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stay Section */}
      <section id="stay" className="py-20 bg-stone-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img src="https://picsum.photos/800/600?random=3" className="rounded-lg shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" alt="Room" />
            </div>
            <div className="md:w-1/2 space-y-6">
               <h2 className="text-4xl font-serif text-rustic-clay">Rest Your Head</h2>
               <div className="flex items-center gap-2 text-rustic-gold">
                 <BedDouble /> <span className="text-sm font-bold tracking-widest">THE COTTAGE SUITE</span>
               </div>
               <p className="text-stone-400">
                 Clean, minimalist rooms with exposed brick walls and warm yellow lighting. 
                 Wake up to the sound of birds and fresh chai served at your door.
               </p>
               <div className="flex flex-wrap gap-3">
                 {['WiFi', 'AC', 'Hot Water', 'Garden View'].map(feat => (
                   <span key={feat} className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-400">{feat}</span>
                 ))}
               </div>
               <button 
                 onClick={() => openBooking('cottage')}
                 className="px-6 py-3 border border-rustic-clay text-rustic-clay hover:bg-rustic-clay hover:text-stone-900 transition-colors"
               >
                 CHECK AVAILABILITY
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 bg-stone-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-serif text-center text-stone-200 mb-12">Glimpses</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
             <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-lg">
                <img src="https://picsum.photos/600/600?random=4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
             </div>
             <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-lg">
                <img src="https://picsum.photos/300/300?random=5" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery" />
             </div>
             <div className="col-span-1 row-span-2 relative group overflow-hidden rounded-lg">
                <img src="https://picsum.photos/300/600?random=6" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery" />
             </div>
             <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-lg">
                <img src="https://picsum.photos/300/300?random=7" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery" />
             </div>
          </div>
        </div>
      </section>

      {/* Footer / Location */}
      <footer className="bg-stone-950 border-t border-stone-900 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
               <h4 className="text-xl font-serif text-rustic-clay mb-4">The Terracotta Grove</h4>
               <p className="text-stone-500 text-sm leading-relaxed">
                 NH-48, Near Lonavala Exit, <br/>
                 Maharashtra 410401
               </p>
               <div className="mt-6">
                 <a className="bg-[#25D366] hover:bg-[#1eba59] text-stone-950 font-bold px-4 py-2 text-xs rounded hover:scale-105 transform duration-300 transition-all inline-flex items-center gap-1.5 shadow w-full md:w-auto" href="https://wa.me/91766697183?text=Hi%2C%20I%2520would%2520like%2520to%2520chat%252520with%252520The%252520Terracotta%252520Grove%252520AI%252520Concierge!" target="_blank" rel="noreferrer">
                   Chat on WhatsApp
                 </a>
               </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-stone-300 mb-4">Hours</h4>
              <ul className="text-stone-500 text-sm space-y-2">
                <li className="flex justify-between"><span>Cafe</span> <span>7:00 AM - 11:00 PM</span></li>
                <li className="flex justify-between"><span>Dining</span> <span>12:00 PM - 11:30 PM</span></li>
                <li className="flex justify-between"><span>Stay</span> <span>24/7 Check-in</span></li>
              </ul>
            </div>
            <div className="col-span-1 md:col-span-3 w-full h-[500px] mt-4 rounded-lg overflow-hidden border border-stone-800">
              <ResortMap />
            </div>
          </div>
          <div className="text-center text-stone-700 text-xs border-t border-stone-900 pt-6">
            © 2026 The Terracotta Grove. All rights reserved.
          </div>
          <div className="flex justify-center mt-1.5">
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="text-stone-800 hover:text-rustic-clay hover:scale-110 transform transition-all duration-300 focus:outline-none"
              title="Operator Entrance"
            >
              <Lock size={12} />
            </button>
          </div>
        </div>
      </footer>

      {/* AI Components */}
      <VoiceConcierge />
      {activeModal === 'veo' && <VeoModal onClose={() => toggleModal(null)} />}
      {activeModal === 'edit' && <ImageEditorModal onClose={() => toggleModal(null)} />}
      {activeModal === 'search' && <SearchModal onClose={() => toggleModal(null)} />}
    </div>
  );
};

export default App;