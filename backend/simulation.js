let stadiumState = {
  heatmapData: [],
  queues: {
    'Gate 1': { currentWaitMin: 2, predictedWaitMin: 5, density: 10 },
    'Gate 2': { currentWaitMin: 15, predictedWaitMin: 20, density: 85 },
    'Gate 3': { currentWaitMin: 5, predictedWaitMin: 4, density: 30 },
    'Food Stall A': { currentWaitMin: 12, predictedWaitMin: 15, density: 60 },
    'Food Stall B': { currentWaitMin: 4, predictedWaitMin: 3, density: 20 },
    'Restroom N': { currentWaitMin: 2, predictedWaitMin: 2, density: 10 },
    'Restroom S': { currentWaitMin: 8, predictedWaitMin: 12, density: 75 },
  },
  alerts: []
};

function generateHeatmap() {
  // Simulating crowd density dynamically across stadium sections
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const data = {};
  sections.forEach(sec => {
    // Random density between 10 and 100
    data[sec] = Math.floor(Math.random() * 90) + 10;
  });
  return data;
}

function updateQueues() {
  // Gently alter the queues up or down to simulate live data
  for (let key in stadiumState.queues) {
    let q = stadiumState.queues[key];
    let change = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
    q.currentWaitMin = Math.max(0, q.currentWaitMin + change);
    q.predictedWaitMin = Math.max(0, q.currentWaitMin + Math.floor(Math.random() * 6) - 1);
    
    // Density maps loosely to wait min
    q.density = Math.min(100, Math.max(0, q.currentWaitMin * 4 + 10));
  }
}

export function loadStadiumState() {
  return stadiumState;
}

export function startSimulation(io) {
  setInterval(() => {
    stadiumState.heatmapData = generateHeatmap();
    updateQueues();
    
    // Auto-detect bottleneck alerts
    const newAlerts = [];
    for (let sec in stadiumState.heatmapData) {
      if (stadiumState.heatmapData[sec] > 85) {
        newAlerts.push(`Section ${sec} is overcrowded!`);
      }
    }
    
    for (let key in stadiumState.queues) {
      if (stadiumState.queues[key].currentWaitMin > 20) {
        newAlerts.push(`Heavy congestion at ${key}. Expect delays.`);
      }
    }
    
    // Merge auto alerts with any manual alerts
    const activeAlerts = [...newAlerts, ...stadiumState.alerts.filter(a => a.manual)];
    
    // Only keep manual alerts for 15 seconds to simulate them fading away
    stadiumState.alerts = activeAlerts.filter(a => {
      if (a.manual) {
        return (Date.now() - a.timestamp) < 15000;
      }
      return true;
    }).map(a => typeof a === 'string' ? a : a.msg);

    // Broadcast entire state
    io.emit('stadiumUpdate', stadiumState);
  }, 3000); // Send updates every 3 seconds
}

export function handleAdminAction(actionType, payload) {
  if (actionType === 'ALERT') {
    stadiumState.alerts.push({ msg: payload, manual: true, timestamp: Date.now() });
  } else if (actionType === 'ADJUST_QUEUE') {
    if (stadiumState.queues[payload.queue]) {
      stadiumState.queues[payload.queue].currentWaitMin += payload.amount;
      if (stadiumState.queues[payload.queue].currentWaitMin < 0) {
         stadiumState.queues[payload.queue].currentWaitMin = 0;
      }
    }
  }
}
