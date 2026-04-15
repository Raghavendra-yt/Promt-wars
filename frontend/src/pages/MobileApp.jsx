import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Map, Navigation2, Clock, Bell, MapPin, Coffee, X } from 'lucide-react';
import StadiumMap from '../components/StadiumMap';

export default function MobileApp() {
  const [stadiumState, setStadiumState] = useState({ heatmapData: {}, queues: {}, alerts: [] });
  const [activeTab, setActiveTab] = useState('map'); // map, nav, queues
  const [avoidCrowds, setAvoidCrowds] = useState(false);
  const [dest, setDest] = useState('');
  const [hiddenAlerts, setHiddenAlerts] = useState(new Set());

  useEffect(() => {
    // Uses current window host
    const socket = io();
    socket.on('stadiumUpdate', (data) => {
      setStadiumState(data);
    });
    return () => socket.disconnect();
  }, []);

  const getSmartRoute = () => {
    if (!dest) return "Select a destination.";
    if (avoidCrowds) {
      return `Routing to ${dest} via Section C (Low density). Est time: 4 mins.`;
    }
    return `Direct route to ${dest} via Section B (High density). Est time: 2 mins.`;
  };

  const handleMapSectionClick = (secId) => {
    setDest(`Section ${secId}`);
    setActiveTab('nav');
  };

  const activeAlert = stadiumState.alerts.find(a => !hiddenAlerts.has(a));

  return (
    <div className="mobile-wrapper">
      <div className="mobile-device">
        {/* Header */}
        <div style={{ padding: '20px', paddingBottom: '10px' }}>
          <div className="flex-row space-between">
            <h2>SmartStadium</h2>
            <div style={{ position: 'relative' }}>
              <Bell size={24} color="var(--text-muted)" />
              {activeAlert && (
                <span style={{
                  position: 'absolute', top: -2, right: -2, 
                  background: 'var(--heat-high)', width: 10, height: 10, borderRadius: '50%'
                }} />
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {activeAlert && activeTab !== 'queues' && (
          <div style={{ padding: '0 20px' }}>
            <div className="floating-alert space-between">
              <div className="flex-row" style={{ gap: '12px' }}>
                <Bell size={18} />
                <div className="text-xs">{activeAlert}</div>
              </div>
              <X 
                size={16} 
                className="cursor-pointer" 
                onClick={() => setHiddenAlerts(new Set([...hiddenAlerts, activeAlert]))} 
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 80px' }}>
          {activeTab === 'map' && (
            <div className="flex-col" style={{ gap: '20px' }}>
              <div className="panel" style={{ padding: '10px' }}>
                 <div className="flex-row space-between" style={{ marginBottom: 10 }}>
                   <h3>Live Heatmap</h3>
                   <span className="text-xs" style={{ color: 'var(--heat-low)' }}>● Live</span>
                 </div>
                 <p className="text-xs" style={{ marginBottom: '10px', textAlign: 'center' }}>Tap any section to get directions</p>
                 <StadiumMap heatmapData={stadiumState.heatmapData} onSectionClick={handleMapSectionClick} />
              </div>
              
              <div className="panel">
                 <h3>Smart Entry Suggestion</h3>
                 <p style={{ marginTop: '8px' }}>
                   Given your location, <strong>Gate 3</strong> is the fastest entry point right now.
                 </p>
                 <button className="btn btn-primary" style={{ marginTop: '12px', width: '100%' }} onClick={() => handleMapSectionClick('Gate 3')}>Navigate to Gate</button>
              </div>
            </div>
          )}

          {activeTab === 'nav' && (
            <div className="flex-col" style={{ gap: '20px' }}>
              <div className="panel">
                <h3>Intelligent Routing</h3>
                <p>Find the best path to your destination.</p>
                
                <div style={{ margin: '16px 0', gap: '10px', display: 'flex', flexDirection: 'column' }}>
                  <select 
                    style={{ padding: '10px', borderRadius: '8px', background: '#fff', color: 'var(--text-main)', border: '1px solid #dadce0' }}
                    value={dest} 
                    onChange={e => setDest(e.target.value)}
                  >
                    <option value="">Choose Destination</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                    <option value="Section D">Section D</option>
                    <option value="Section E">Section E</option>
                    <option value="Section F">Section F</option>
                    <option value="Section Gate 3">Gate 3</option>
                    <option value="Seat 42 (Sec B)">Seat 42 (Sec B)</option>
                    <option value="Food Stall A">Food Stall A</option>
                    <option value="Restroom S">Restroom S</option>
                  </select>

                  <div className="flex-row space-between" style={{ marginTop: '10px' }}>
                    <span className="text-xs">Avoid Crowded Areas</span>
                    <label className="switch">
                      <input type="checkbox" checked={avoidCrowds} onChange={() => setAvoidCrowds(!avoidCrowds)} />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                {dest && (
                  <div style={{ padding: '12px', background: '#e8f0fe', borderRadius: '8px', border: '1px solid #adccf7' }}>
                    <div className="flex-row" style={{ gap: '8px', marginBottom: '8px' }}>
                      <MapPin size={16} color="var(--accent-primary)" />
                      <strong style={{ fontSize: '0.9rem' }}>Suggested Route</strong>
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>{getSmartRoute()}</p>
                  </div>
                )}
              </div>
              
              <div className="panel">
                <h3>In-Seat Ordering</h3>
                <div className="flex-row space-between" style={{ marginTop: '12px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #dadce0' }}>
                  <div className="flex-row" style={{ gap: '12px' }}>
                     <Coffee size={24} color="var(--accent-primary)" />
                     <div>
                       <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hot Dog & Soda</div>
                       <div className="text-xs">Est. prep: 5 mins</div>
                     </div>
                  </div>
                  <button className="btn" onClick={() => alert("Order Placed!")}>Order</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queues' && (
            <div className="flex-col" style={{ gap: '16px' }}>
              <h2 style={{ marginBottom: '8px' }}>Live Wait Times</h2>
              {Object.keys(stadiumState.queues).map(q => {
                const wait = stadiumState.queues[q].currentWaitMin;
                let color = 'var(--heat-low)';
                if (wait > 10) color = 'var(--heat-medium)';
                if (wait > 20) color = 'var(--heat-high)';

                return (
                  <div key={q} className="panel flex-row space-between">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{q}</div>
                      <div className="text-xs text-muted">Pred. in 15m: {stadiumState.queues[q].predictedWaitMin}m</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{wait}m</div>
                      <div className="text-xs text-muted">Wait</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="bottom-nav">
          <div className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
            <Map size={24} />
            <span>Map</span>
          </div>
          <div className={`nav-item ${activeTab === 'nav' ? 'active' : ''}`} onClick={() => setActiveTab('nav')}>
            <Navigation2 size={24} />
            <span>Route & Food</span>
          </div>
          <div className={`nav-item ${activeTab === 'queues' ? 'active' : ''}`} onClick={() => setActiveTab('queues')}>
            <Clock size={24} />
            <span>Queues</span>
          </div>
        </div>
      </div>
    </div>
  );
}
