import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Users, AlertTriangle, Activity, RefreshCw, Plus, Minus } from 'lucide-react';
import StadiumMap from '../components/StadiumMap';

export default function AdminDashboard() {
  const [stadiumState, setStadiumState] = useState({ heatmapData: {}, queues: {}, alerts: [] });
  const [manualAlert, setManualAlert] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Uses current window host
    const s = io();
    setSocket(s);
    s.on('stadiumUpdate', (data) => {
      setStadiumState(data);
    });
    return () => s.disconnect();
  }, []);

  const sendManualAlert = () => {
    if (socket && manualAlert) {
      socket.emit('adminAction', { type: 'ALERT', payload: manualAlert });
      setManualAlert('');
    }
  };

  const adjustQueue = (queueName, amount) => {
    if (socket) {
      socket.emit('adminAction', { type: 'ADJUST_QUEUE', payload: { queue: queueName, amount } });
    }
  };

  const activeAlerts = stadiumState.alerts;

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="flex-row space-between" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>
            SmartStadium AI Control Center
          </h1>
          <p>Real-time telemetry and crowd control.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="panel flex-col center" style={{ minWidth: 120 }}>
            <Users size={24} color="var(--accent-primary)" />
            <div className="stat-value text-xs" style={{ fontSize: '1.25rem' }}>Live</div>
            <div className="text-xs text-muted">Connection</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Main Map */}
        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="flex-row space-between" style={{ marginBottom: '20px' }}>
            <h2>Live Crowd Map</h2>
            <div className="flex-row" style={{ gap: '8px' }}>
              <RefreshCw size={16} className="animate-pulse" color="var(--heat-low)" />
              <span className="text-xs text-muted">Syncing...</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', background: '#f8f9fa', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            {/* Make it bigger for desktop */}
            <div style={{ transform: 'scale(1.2)', transformOrigin: 'top center', paddingBottom: '40px' }}>
              <StadiumMap 
                heatmapData={stadiumState.heatmapData} 
                onSectionClick={(sec) => alert(`Detailed logs for Section ${sec}: Density is ${stadiumState.heatmapData[sec]}%`)} 
              />
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-col" style={{ gap: '24px' }}>
          
          {/* Bottlenecks Panel */}
          <div className="panel" style={{ flex: 1 }}>
            <div className="flex-row" style={{ gap: '10px', marginBottom: '20px' }}>
              <Activity size={24} color="var(--heat-medium)" />
              <h2>Active Queues Control</h2>
            </div>
            
            <div className="flex-col" style={{ gap: '8px' }}>
               {Object.keys(stadiumState.queues).map(q => (
                 <div key={q} style={{ width: '100%', padding: '12px', background: '#f8f9fa', borderRadius: '8px', borderLeft: `4px solid ${stadiumState.queues[q].currentWaitMin > 15 ? 'var(--heat-high)' : 'var(--heat-low)'}` }}>
                   <div className="flex-row space-between">
                     <strong>{q}</strong>
                     <div className="flex-row" style={{ gap: '10px' }}>
                        <span style={{ minWidth: '45px', textAlign: 'right' }}>{stadiumState.queues[q].currentWaitMin} min</span>
                        <button className="btn" style={{ padding: '4px', borderRadius: '4px' }} onClick={() => adjustQueue(q, -5)}><Minus size={14}/></button>
                        <button className="btn" style={{ padding: '4px', borderRadius: '4px' }} onClick={() => adjustQueue(q, 5)}><Plus size={14}/></button>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Alerts & Control */}
          <div className="panel">
            <div className="flex-row" style={{ gap: '10px', marginBottom: '20px' }}>
              <AlertTriangle size={24} color="var(--heat-high)" />
              <h2>System Alerts</h2>
            </div>
            
            <div style={{ minHeight: '100px', marginBottom: '20px' }}>
              {activeAlerts.length === 0 ? (
                <p>No critical alerts at this time.</p>
              ) : (
                activeAlerts.map((alt, idx) => (
                  <div key={idx} className="floating-alert" style={{ marginBottom: '8px' }}>
                    <span className="text-xs">{alt}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #dadce0' }}>
              <h3>Manual Broadcast</h3>
              <p style={{ fontSize: '0.8rem', marginBottom: '12px' }}>Send custom notification to all users.</p>
              <div className="flex-row" style={{ gap: '10px' }}>
                <input 
                  type="text" 
                  value={manualAlert}
                  onChange={e => setManualAlert(e.target.value)}
                  placeholder="e.g. Halftime show starting in 5 mins" 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#fff', color: 'var(--text-main)', border: '1px solid #dadce0' }}
                />
                <button className="btn btn-primary" onClick={sendManualAlert}>Send</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
