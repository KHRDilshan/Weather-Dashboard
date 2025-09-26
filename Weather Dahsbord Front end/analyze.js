const sidebar = document.getElementById("sidebar");
const sidebarBtn = document.querySelector(".sidebarBtn");
const tabs = document.querySelectorAll(".sidebar .nav-links li");
const closeBtn = document.querySelector(".closeBtn");

sidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});
closeBtn.addEventListener("click", () => {
  sidebar.classList.add("close");
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const page = tab.getAttribute("data-page");
    if (page === "dashboard") {
     window.location.href = "index.html";
    } else if (page === "analyze") {
    window.location.href = "Analyze.html";
    }
  });
});

    const paramButtons = document.querySelectorAll(".parameter-btn");
    paramButtons.forEach(button => {
      button.addEventListener("click", () => {
        paramButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        clearActiveFilters();
      });
    });


    // Loading spinner functionality
const loadingOverlay = document.getElementById('loading-overlay');

function showLoader(message = 'Loading data...') {
  const messageElement = loadingOverlay.querySelector('.loading-message');
  messageElement.textContent = message;
  loadingOverlay.classList.add('active');
}

function hideLoader() {
  loadingOverlay.classList.remove('active');
}
    // Popup functionality
const popupOverlay = document.getElementById('popup-overlay');
const popupTitle = document.getElementById('popup-title');
const popupMessage = document.getElementById('popup-message');
const popupButton = document.getElementById('popup-button');

function showPopup(title, message) {
  popupTitle.textContent = title;
  popupMessage.textContent = message;
  popupOverlay.classList.add('active');
  
  // Close popup when clicking the button
  popupButton.onclick = function() {
    popupOverlay.classList.remove('active');
  };
  
  // Close popup when clicking outside the content
  popupOverlay.onclick = function(e) {
    if (e.target === popupOverlay) {
      popupOverlay.classList.remove('active');
    }
  };
}

function clearChart() {
  if (window.myChart) {
    window.myChart.destroy();
    window.myChart = null;
  }
  
  // Clear the canvas visually
  const canvas = document.getElementById('chart-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
}
  const submitBtn = document.getElementById("submit-btn");
 
  if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
     clearActiveFilters();
       const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;
          const activeParamBtn = document.querySelector(".parameter-btn.active");
  if (!startDate || !endDate) {
      showPopup("Missing Information", "Please select both start and end dates");
      return;
    }
  if (!startTime || !endTime) {
  showPopup("Missing Information !", "Please select both start and end times");
  return;
}

if (!activeParamBtn) {
  showPopup("Selection Required !", "Please select a parameter");
  return;
}

 const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (startDateTime > endDateTime) {
      showPopup("Invalid Range", "The end date and time must be later than the start date and time.");
      return;
    }

    if (!activeParamBtn) {
      showPopup("Selection Required", "Please select a parameter");
      return;
    }
    
const selectedParam = activeParamBtn.dataset.param;
    try {
      showLoader("Fetching data...");
  const response = await fetch(`http://192.168.1.16:3005/sensorReadingsByDateTime?startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}&parameter=${selectedParam}`);      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }
       if (data.length === 0) {
         clearChart();
        showPopup("No Data", "No sensor data found for the selected time range");
      } else {
        const chartData = processDataForChart(data);
        renderChart(chartData);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      showPopup("No sensor data found for the selected time range");
      clearChart();
    }finally {
      hideLoader();
    }
  });
}


const paramColors = {
  "local temperature": "#10b981",
  "temperature": "#e71831",
  "pressure": "#f59e0b",
  "humidity": "#006de8 "
};

const filterButtons = document.querySelectorAll(".data-filter-btn");
let activeParams = []; 
filterButtons.forEach(button => {
  button.addEventListener("click", function () {
    const param = this.dataset.param;

    if (activeParams.includes(param)) {
      activeParams = activeParams.filter(p => p !== param);
      this.classList.remove("active");
      this.style.background = ""; 
      this.style.borderColor = ""; 
    } else {
      activeParams.push(param);
      this.classList.add("active");
this.style.setProperty("--active-bg", `${paramColors[param]}33`);
this.style.setProperty("--active-border", paramColors[param]);

    }

    filterChartData(activeParams);
  });
});

function clearActiveFilters() {
  const activeFilterButtons = document.querySelectorAll(".data-filter-btn.active");
  activeFilterButtons.forEach(btn => {
    btn.classList.remove("active");
    btn.style.background = "";
    btn.style.borderColor = "";
  });
  activeParams = []; // Clear the active parameters array
}

function filterChartData(selectedParams) {
  if (!window.myChart || !window.originalChartData) return;

  if (selectedParams.length === 0) {
    window.myChart.data.datasets = window.originalChartData.datasets;
  } else {
    window.myChart.data.datasets = window.originalChartData.datasets.filter(ds =>
      selectedParams.some(param =>
       ds.label.toLowerCase() === param.toLowerCase() 
      )
    );
  }

  window.myChart.update();
}

function processDataForChart(data) {
  const labels = data.map(row => {
    const date = new Date(row.time);
    return date.toLocaleTimeString();
  });

  window.originalChartData = {
    labels,
    datasets: [

      {
        label: 'Local Temperature',
        data: data.map(row => row.localTemperature),
        borderColor: '#10b981',
        fill: false,
        tension: 0.1,
        borderWidth: 1
      },
            {
        label: 'Temperature',
        data: data.map(row => row.temperature),
        borderColor: '#e71831',
        fill: true,
        tension: 0.1,
        borderWidth: 1
      },
      {
        label: 'Pressure',
        data: data.map(row => row.pressure),
        borderColor: '#f59e0b',
        fill: false,
        tension: 0.1,
        borderWidth: 1
      },
      {
        label: 'Humidity',
        data: data.map(row => row.humidity),
        borderColor: '#006de8',
        fill: false,
        tension: 0.1,
        borderWidth: 1
      }
    ]
  };

  return window.originalChartData;
}

function renderChart({ labels, datasets }) {
  const ctx = document.getElementById('chart-canvas').getContext('2d');

  if (window.myChart) {
    window.myChart.destroy(); 
  }

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      plugins: {
        legend: {
          display: false 
        }
      },
      scales: {
        x: {
          title: {
            display: true,
          }
        },
        y: {
          title: {
            display: true,
          }
        }
      }
    }
  });
}

// Function to set current time
function setCurrentTime() {
  const now = new Date();
  
  // Set start time to current time minus 1 hour
  const startTime = new Date(now.getTime() - (60 * 1000)); // 1 hour ago
  document.getElementById('start-hour').value = startTime.getHours().toString().padStart(2, '0');
  document.getElementById('start-minute').value = startTime.getMinutes().toString().padStart(2, '0');
  document.getElementById('start-second').value = startTime.getSeconds().toString().padStart(2, '0');
  
  // Set end time to current time
  document.getElementById('end-hour').value = now.getHours().toString().padStart(2, '0');
  document.getElementById('end-minute').value = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('end-second').value = now.getSeconds().toString().padStart(2, '0');
  
  // Update the hidden inputs
  updateStartTime();
  updateEndTime();
}

// Call this after populating the selects
populateSelect('start-hour', 23);
populateSelect('start-minute', 59);
populateSelect('start-second', 59);
populateSelect('end-hour', 23);
populateSelect('end-minute', 59);
populateSelect('end-second', 59);

// Set current time when page loads
setCurrentTime();

function populateSelect(id, max) {
  const select = document.getElementById(id);
  for(let i = 0; i <= max; i++) {
    const val = i.toString().padStart(2, '0');
    const option = document.createElement('option');
    option.value = val;
    option.textContent = val;
    select.appendChild(option);
  }
}

populateSelect('start-hour', 23);
populateSelect('start-minute', 59);
populateSelect('start-second', 59);

function updateStartTime() {
  const h = document.getElementById('start-hour').value || '00';
  const m = document.getElementById('start-minute').value || '00';
  const s = document.getElementById('start-second').value || '00';
  document.getElementById('start-time').value = `${h}:${m}:${s}`;
}

document.getElementById('start-hour').addEventListener('change', updateStartTime);
document.getElementById('start-minute').addEventListener('change', updateStartTime);
document.getElementById('start-second').addEventListener('change', updateStartTime);

updateStartTime();


function populateSelect(id, max) {
  const select = document.getElementById(id);
  for(let i = 0; i <= max; i++) {
    const val = i.toString().padStart(2, '0');
    const option = document.createElement('option');
    option.value = val;
    option.textContent = val;
    select.appendChild(option);
  }
}

populateSelect('end-hour', 23);
populateSelect('end-minute', 59);
populateSelect('end-second', 59);

function updateEndTime() {
  const h = document.getElementById('end-hour').value || '00';
  const m = document.getElementById('end-minute').value || '00';
  const s = document.getElementById('end-second').value || '00';
  document.getElementById('end-time').value = `${h}:${m}:${s}`;
}

document.getElementById('end-hour').addEventListener('change', updateEndTime);
document.getElementById('end-minute').addEventListener('change', updateEndTime);
document.getElementById('end-second').addEventListener('change', updateEndTime);

updateEndTime();


// Function to set current date
function setCurrentDate() {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  // Set start date to today
  document.getElementById('start-date').value = today;
  
  // Set end date to today
  document.getElementById('end-date').value = today;
}

// Function to format date for display (optional)
function formatDateForDisplay(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  setCurrentTime(); // Your existing time setting function
});