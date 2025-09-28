// Side Navigation Bar Handle
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
     window.location.href = "VideoDashboard.html";
    } else if (page === "analyze") {
    window.location.href = "SensorAnalysis.html";
    }
  });
});


    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      }
    };
    
    // Generate time labels for the last 24 hours
const generateTimeLabels = (length = 10) => {
  const labels = [];
  const now = new Date();
  for (let i = length - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 1000); // last i seconds
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    labels.push(`${m}:${s}`);
  }
  return labels;
};


const createChart = (ctx, label, baseValue, borderColor, backgroundColor) => {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateTimeLabels(10),
      datasets: [{
        label,
        data: new Array(10).fill(baseValue),
        borderColor,
        backgroundColor: backgroundColor,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: new Array(10).fill('transparent').map((v,i,arr) => i===arr.length-1 ? borderColor : 'transparent'),
        pointRadius: new Array(10).fill(0).map((v,i,arr) => i===arr.length-1 ? 5 : 0),
        pointHoverRadius: new Array(10).fill(0).map((v,i,arr) => i===arr.length-1 ? 8 : 0)
      }]
    },
    options: chartOptions
  });
};

// Create all charts
const temperatureChart = createChart(document.getElementById('temperatureChart'), 'Température', 22, '#e94560', 'rgba(233, 69, 96, 0.1)' );
const humidityChart = createChart(document.getElementById('humidityChart'), 'Humidité', 45, '#4cc9f0', 'rgba(76, 201, 240, 0.1)' );
const co2Chart = createChart(document.getElementById('co2Chart'), 'CO₂', 450, '#2ecc71', 'rgba(46, 204, 113, 0.1)');
const pressureChart = createChart(document.getElementById('pressureChart'), 'Pression', 1013, '#9b59b6',  'rgba(155, 89, 182, 0.1)');
const pm25Chart = createChart(document.getElementById('pm25Chart'), 'PM 2.5', 5, '#f39c12',  'rgba(243, 156, 18, 0.1)');
const pm10Chart = createChart(document.getElementById('pm10Chart'), 'PM 10', 12, '#d35400', 'rgba(211, 84, 0, 0.1)');

    // Update sensor data with random values (simulating real-time updates)
function updateSensorData(temperature, humidity, pressure, altitude, co2, pm25, pm10) {
  document.getElementById('humidityValue').innerHTML = `${humidity}<span class="sensor-unit">%</span>`;
  document.getElementById('temperatureValue').innerHTML = `${temperature}<span class="sensor-unit">°C</span>`;
  document.getElementById('co2Value').innerHTML = `${co2}<span class="sensor-unit">ppm</span>`;
  document.getElementById('pressureValue').innerHTML = `${pressure}<span class="sensor-unit">hPa</span>`;
  document.getElementById('pm25Value').innerHTML = `${pm25}<span class="sensor-unit">µg/m³</span>`;
  document.getElementById('pm10Value').innerHTML = `${pm10}<span class="sensor-unit">µg/m³</span>`;

  // Update charts
  updateChart(temperatureChart, temperature);
  updateChart(humidityChart, humidity);
  updateChart(co2Chart, co2);
  updateChart(pressureChart, pressure);
  updateChart(pm25Chart, pm25);
  updateChart(pm10Chart, pm10);

      document.getElementById('humidityChartValue').innerHTML = `${humidity}<span class="chart-unit">%</span>`;
  document.getElementById('temperatureChartValue').innerHTML = `${temperature}<span class="chart-unit">°C</span>`;
  document.getElementById('co2ChartValue').innerHTML = `${co2}<span class="chart-unit">ppm</span>`;
  document.getElementById('pressureChartValue').innerHTML = `${pressure}<span class="chart-unit">hPa</span>`;
  document.getElementById('pm25ChartValue').innerHTML = `${pm25}<span class="chart-unit">µg/m³</span>`;
  document.getElementById('pm10ChartValue').innerHTML = `${pm10}<span class="chart-unit">µg/m³</span>`;
}

// Start updating every second
// setInterval(updateSensorData, 1000);
// updateSensorData(); // Initial update

   
function updateChart(chart, newValue) {
  chart.data.datasets[0].data.shift();           // Remove oldest
  chart.data.datasets[0].data.push(parseFloat(newValue)); // Add newest
  chart.data.labels = generateTimeLabels(10);     // Update labels

  // Highlight last point
  const borderColor = chart.data.datasets[0].borderColor;
  chart.data.datasets[0].pointBackgroundColor = chart.data.datasets[0].data.map((v,i,arr) => i===arr.length-1 ? borderColor : 'transparent');
  chart.data.datasets[0].pointRadius = chart.data.datasets[0].data.map((v,i,arr) => i===arr.length-1 ? 5 : 0);

  chart.update('none');

}

    
    // Camera controls
    // document.getElementById('refreshBtn').addEventListener('click', function() {
    //   const img = document.querySelector('.video-container img');
    //   // Add timestamp to prevent caching
    //   img.src = "http://192.168.1.16:9082?" + new Date().getTime();
    // });
    
    // document.getElementById('fullscreenBtn').addEventListener('click', function() {
    //   const img = document.querySelector('.video-container img');
    //   if (img.requestFullscreen) {
    //     img.requestFullscreen();
    //   } else if (img.webkitRequestFullscreen) {
    //     img.webkitRequestFullscreen();
    //   } else if (img.msRequestFullscreen) {
    //     img.msRequestFullscreen();
    //   }
    // });
    
    // document.getElementById('snapshotBtn').addEventListener('click', function() {
    //   // In a real implementation, this would capture the current frame
    //   alert('Fonction de capture d\'écran activée');
    // });
    
    // Update data every 5 seconds
    // setInterval(updateSensorData, 1000);
    
    // Initial data update
    


    function updateSensorDataReadings() {
    fetch(`http://localhost:3002/sensorDataReadingsVideoStream`)
        .then((response) => response.json())
        .then((jsonResponse) => {
                let temperature = jsonResponse.temperature;
      let humidity = jsonResponse.humidity;
      let pressure = jsonResponse.pressure;
            let altitude = jsonResponse.altitude;
            let co2 = jsonResponse.co2;
            let pm25 = jsonResponse.pm25;
            let pm10 = jsonResponse.pm10;
            let location = jsonResponse.location;
            console.log({ temperature, humidity, pressure, altitude, co2, pm25, pm10 });
            updateSensorData(temperature, humidity, pressure, altitude, co2, pm25, pm10);
document.getElementById('location').innerHTML = location;
    const now = new Date();

const options = {
  weekday: 'long',   
  day: '2-digit',    
  month: 'short',    
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false     
};

document.getElementById("lastUpdate").innerText = 
  now.toLocaleDateString('en-US', options).replace(',', '');

        });
}

    (function loop() {
        setTimeout(() => {
            updateSensorDataReadings();
            loop();
        }, 1000);
    })();




