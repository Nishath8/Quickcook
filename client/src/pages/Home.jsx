import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CookCard from '../components/CookCard';
import Filters from '../components/Filters';
import { ChefHat, AlertCircle } from 'lucide-react';

export default function Home() {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ location: '', cuisine: '', dietary: '', price_range: '' });

  // Debounce effect to avoid too many API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (filters.location) params.append('location', filters.location);
        if (filters.cuisine) params.append('cuisine', filters.cuisine);
        if (filters.dietary) params.append('dietary', filters.dietary);
        if (filters.price_range) params.append('price_range', filters.price_range);

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cooks?${params.toString()}`);
        setCooks(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch cooks. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 400); // 400ms debounce

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  // Observer for fade-in animations
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    
    // Add small delay to ensure DOM is fully painted after loading state changes
    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
    }, 100);

    return () => obs.disconnect();
  }, [cooks, loading]);

  return (
    <div className="animate-in fade-in duration-500 pb-16">
      <div className="hero">
        <div>
          <div className="hero-eyebrow">
            <div className="eyebrow-dot"></div>
            Bengaluru's trust-first cook marketplace
          </div>
          <h1 className="hero-h1">
            Home cooks,<br />
            <em>vouched for</em><br />
            by your neighbours.
          </h1>
          <p className="hero-sub">
            Every cook on Quickcook is verified by real past clients and background-checked — so you get a trusted home cook, not a stranger from the internet.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => document.getElementById('cooks').scrollIntoView({ behavior: 'smooth' })}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Find a cook near you
            </button>
            <Link to="/add" className="btn-ghost">List your services</Link>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <svg viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4H14l-3.5 2.5 1.5 4L8 9 4 11.5l1.5-4L2 5h4.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              Background checked
            </div>
            <div className="trust-item">
              <svg viewBox="0 0 16 16" fill="none"><path d="M13 4L6 11 3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Client-vouched
            </div>
            <div className="trust-item">
              <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Recurring bookings
            </div>
          </div>
        </div>

        {/* Hero right — floating card preview */}
        <div className="hero-card-preview">
          <div className="float-badge">
            <div className="float-badge-dot"></div>
            24 cooks in Indiranagar
          </div>
          <div className="preview-card">
            <div className="preview-tag">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1A6B4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Verified cook
            </div>
            <div className="preview-header">
              <div className="av-circle av-teal">M</div>
              <div>
                <div className="preview-name">Meera Krishnan</div>
                <div className="preview-cuisine">South Indian · Kerala · Chettinad</div>
                <div className="v-badge">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1A6B4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Background checked
                </div>
              </div>
            </div>
            <div className="vouches-strip">
              <div className="vouch-avs">
                <div className="vav">R</div><div className="vav">S</div><div className="vav">A</div><div className="vav">P</div>
              </div>
              <span className="vouches-text">Vouched by 4 past clients</span>
            </div>
            <div className="preview-meta">
              <div className="pm"><svg viewBox="0 0 14 14" fill="none"><path d="M7 1C4.79 1 3 2.79 3 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2"/></svg>Koramangala</div>
              <div className="pm"><svg viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>Daily, 7–10am</div>
              <div className="pm"><svg viewBox="0 0 14 14" fill="none"><path d="M2 10c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>Veg only</div>
              <div className="pm"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11V7M7 11V3M11 11V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>12 bookings/mo</div>
            </div>
            <div className="stars-row">
              <span className="stars" style={{color:'#C17B2A'}}>★★★★★</span>
              <span style={{fontSize:'13px',fontWeight:500,color:'var(--ink)'}}>4.9</span>
              <span style={{fontSize:'12px',color:'var(--ink4)'}}>· 18 reviews</span>
            </div>
            <div className="locked-block">
              <div className="locked-fields">
                <div><div className="lf-label">Price / meal</div><div className="lf-blur">₹380–480</div></div>
                <div><div className="lf-label">Contact</div><div className="lf-blur">+91 98765</div></div>
              </div>
              <button className="btn-signin">
                <div className="g-icon">
                  <svg width="10" height="10" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                </div>
                Sign in with Google to view
              </button>
            </div>
            <div className="preview-card-footer">
              <button className="btn-card-p">View profile</button>
              <button className="btn-card-s">Reviews (18)</button>
            </div>
          </div>
        </div>
      </div>

      <Filters filters={filters} onFilterChange={setFilters} />

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 flex items-start rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 mt-10">
          <ChefHat className="w-12 h-12 text-primary-200 animate-bounce" />
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading cooks...</p>
        </div>
      ) : cooks.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed mt-10 max-w-3xl mx-auto">
          <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No cooks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your location or cuisine filters.
          </p>
        </div>
      ) : (
        <div id="cooks" className="section" style={{paddingTop: '2rem'}}>
          <div className="section-header fade-in">
            <div className="section-eyebrow">Available now</div>
            <h2 className="section-h2">Cooks near you</h2>
            <p className="section-sub">All verified, all vouched. Sign in to see contact details and pricing.</p>
          </div>

          <div className="cards-grid">
            {[...cooks].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).map((cook, index) => (
              <div 
                key={cook._id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CookCard cook={cook} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOW IT WORKS */}
      <div id="how" className="how-section my-16 mx-[-1rem] sm:mx-[calc(-50vw+50%)] relative w-[100vw]">
        <div className="section">
          <div className="section-header fade-in">
            <div className="section-eyebrow">The process</div>
            <h2 className="section-h2">How Quickcook works</h2>
            <p className="section-sub">From first visit to weekly home-cooked meals in four steps.</p>
          </div>
          <div className="steps-grid">
            <div className="step fade-in">
              <div className="step-icon">
                <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10 6v4.5l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <div className="step-num">01</div>
              <div className="step-title">Browse vetted cooks</div>
              <div className="step-body">Search by area and cuisine. Every listing is live only after a background check and minimum 3 client vouches.</div>
            </div>
            <div className="step fade-in" style={{transitionDelay:'0.1s'}}>
              <div className="step-icon">
                <svg viewBox="0 0 20 20" fill="none"><path d="M10 2L12.5 7h5.5l-4.5 3.3 1.7 5.2L10 12.5l-5.2 3 1.7-5.2L2 7h5.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              </div>
              <div className="step-num">02</div>
              <div className="step-title">Sign in to unlock</div>
              <div className="step-body">Sign in with Google to see pricing and contact details. Your details stay private — cooks can't see your number either.</div>
            </div>
            <div className="step fade-in" style={{transitionDelay:'0.2s'}}>
              <div className="step-icon">
                <svg viewBox="0 0 20 20" fill="none"><path d="M4 4h12v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4V2M12 4V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <div className="step-num">03</div>
              <div className="step-title">Connect and agree terms</div>
              <div className="step-body">Reach out via WhatsApp or in-app chat. Discuss menu, timings, and frequency directly — then confirm your recurring schedule.</div>
            </div>
            <div className="step fade-in" style={{transitionDelay:'0.3s'}}>
              <div className="step-icon">
                <svg viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="step-num">04</div>
              <div className="step-title">Leave a verified review</div>
              <div className="step-body">After your first week, leave a verified review. Your review becomes a vouch that helps the cook build their reputation.</div>
            </div>
          </div>
        </div>
      </div>

      {/* TRUST PILLARS */}
      <div className="section pt-0">
        <div className="section-header fade-in">
          <div className="section-eyebrow">Why Quickcook</div>
          <h2 className="section-h2">Built on trust, not just ratings</h2>
          <p className="section-sub">Any app can have star ratings. We built something harder to fake.</p>
        </div>
        <div className="trust-grid">
          <div className="trust-card fade-in">
            <div className="trust-icon-wrap" style={{background:'var(--green-light)'}}>
              <svg viewBox="0 0 22 22" fill="none" style={{color:'var(--green)'}}><path d="M11 2l2 5.5H19l-4.9 3.6 1.9 5.9L11 13.5l-5 3.5 1.9-5.9L3 7.5h6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
            </div>
            <div className="trust-title">Client-vouched first</div>
            <div className="trust-body">Cooks can't list until real past clients vouch for them. No self-promotion, no fake profiles — social proof from people who actually hired them.</div>
          </div>
          <div className="trust-card fade-in" style={{transitionDelay:'0.1s'}}>
            <div className="trust-icon-wrap" style={{background:'#E6F1FB'}}>
              <svg viewBox="0 0 22 22" fill="none" style={{color:'#185FA5'}}><rect x="4" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <div className="trust-title">Background checked</div>
            <div className="trust-body">Every cook goes through an independent background verification before their profile goes live. You know who's entering your home.</div>
          </div>
          <div className="trust-card fade-in" style={{transitionDelay:'0.2s'}}>
            <div className="trust-icon-wrap" style={{background:'var(--amber-light)'}}>
              <svg viewBox="0 0 22 22" fill="none" style={{color:'var(--amber)'}}><path d="M11 3C7.69 3 5 5.69 5 9c0 4.5 6 11 6 11s6-6.5 6-11c0-3.31-2.69-6-6-6z" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="9" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>
            </div>
            <div className="trust-title">Hyper-local</div>
            <div className="trust-body">We focus on Bengaluru neighbourhoods first. Your cook likely lives nearby — that's a relationship, not a transaction.</div>
          </div>
          <div className="trust-card fade-in" style={{transitionDelay:'0.3s'}}>
            <div className="trust-icon-wrap" style={{background:'#FAECE7'}}>
              <svg viewBox="0 0 22 22" fill="none" style={{color:'#7B3322'}}><path d="M4 11c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z" stroke="currentColor" strokeWidth="1.3"/><path d="M8 11l2.5 2.5L14 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="trust-title">Recurring relationships</div>
            <div className="trust-body">Weekly meal prep, not one-off gigs. Once you find your cook, they learn your preferences, your schedule, and your kitchen.</div>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{background:'white', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)'}} className="mx-[-1rem] sm:mx-[calc(-50vw+50%)] relative w-[100vw]">
        <div className="section">
          <div className="section-header fade-in">
            <div className="section-eyebrow">From real households</div>
            <h2 className="section-h2">What people are saying</h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card fade-in">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-quote">"Found Meera through a neighbour's vouch. She's been cooking for us every weekday for 4 months. We don't even think about it anymore — it just happens."</div>
              <div className="testi-author">
                <div className="testi-av" style={{background:'var(--green-light)',color:'var(--green)'}}>P</div>
                <div><div className="testi-name">Priya R.</div><div className="testi-location">Koramangala, Bengaluru</div></div>
              </div>
            </div>
            <div className="testi-card fade-in" style={{transitionDelay:'0.1s'}}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-quote">"The background check gave me confidence. Two kids at home — I needed to know exactly who was coming in. Quickcook made that clear from the start."</div>
              <div className="testi-author">
                <div className="testi-av" style={{background:'#E6F1FB',color:'#0C447C'}}>A</div>
                <div><div className="testi-name">Anand K.</div><div className="testi-location">Indiranagar, Bengaluru</div></div>
              </div>
            </div>
            <div className="testi-card fade-in" style={{transitionDelay:'0.2s'}}>
              <div className="testi-stars">★★★★☆</div>
              <div className="testi-quote">"As a cook, this platform actually helped me formalise what I was already doing. My clients vouched for me, and now I get 3x more regular bookings."</div>
              <div className="testi-author">
                <div className="testi-av" style={{background:'#FAECE7',color:'#7B3322'}}>S</div>
                <div><div className="testi-name">Suresh N.</div><div className="testi-location">Cook · Jayanagar</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <div className="cta-band mx-[-1rem] sm:mx-[calc(-50vw+50%)] relative w-[100vw]">
        <h2 className="cta-h2">Ready for home-cooked food<br/>you can <em>actually trust?</em></h2>
        <p className="cta-sub">Join Quickcook — find a verified cook in your neighbourhood today.</p>
        <div className="cta-btns">
          <button className="btn-cta-p" onClick={() => document.getElementById('cooks').scrollIntoView({ behavior: 'smooth' })}>Find a cook near me</button>
          <Link to="/add" className="btn-cta-s">List your cooking services</Link>
        </div>
      </div>
    </div>
  );
}
