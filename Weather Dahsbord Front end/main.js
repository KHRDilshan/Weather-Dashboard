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
     window.location.href = "index.html";
    } else if (page === "analyze") {
    window.location.href = "Analyze.html";
    }
  });
});


// DOM Elements
var temperatureDiv = document.getElementById("temperature");
var temperaturelocaleHistoryDiv = document.getElementById("temperature_locale-history");

var temperatureGaugeDiv = document.getElementById("temperature-gauge");
const temperatureGaugeVal = document.getElementById('temperature-gaugeValue');

var temperatureHistoryCtx = document.getElementById('temperature-history').getContext('2d');
var temperatureLocalCtx = document.getElementById('temperature_locale-history').getContext('2d');
var temperatureLocalGuaugeCtx = document.getElementById('temperature_locale-gauge').getContext('2d');
var presureCtx = document.getElementById('presure-history').getContext('2d');
var humidityCtx = document.getElementById('humidity-history').getContext('2d');


const COLORS = ['rgb(140, 214, 16)', 'rgb(239, 198, 0)', 'rgb(231, 24, 49)'];
const MIN_TEMP = 0;
const MAX_TEMP = 100;

function getColorIndex(value) {
  if (value < 33) return 0;
  if (value < 66) return 1;
  return 2;
}

function getColorForValue(celsius) {
  if (celsius < 10) return '#27ae60';   // Calm green — cool/comfortable
  if (celsius < 20) return '#2980b9';   // Soothing blue — mild/moderate
  if (celsius < 30) return '#f39c12';   // Warm orange — getting hot
  return '#c0392b';                     // Alert red — very hot
}

function getColorForLocalValue(celsius) {
  if (celsius < 20) return '#808080';   // Gray
  if (celsius < 50) return '#FF0000';   // Red
  if (celsius < 70) return '#f55807';   // Amber
  if (celsius < 80) return '#fda300';   // Orange
  if (celsius < 90) return '#fff000';   // Yellow
  if (celsius <= 100) return '#3fff03'; // Green
  return '#3fff03';                     // Above 100°C, still Green
}


function generateTimeLabels() {
    const now = new Date();
    const labels = [];
    for (let i = 3; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 1000);
        labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
    return labels;
}

function getColorForPresure(pressure) {
  if (pressure < 970) return '#e74c3c';    // Very low pressure — strong red (storm risk)
  if (pressure < 990) return '#f39c12';    // Low pressure — orange (unstable weather)
  if (pressure < 1020) return '#3498db';   // Normal pressure — calm blue (moderate)
  return '#27ae60';                        // High pressure — green (stable/clear)
}

function getColorForHumidity(humidity) {
  if (humidity < 20) return '#2ecc71';   // Very dry — fresh green
  if (humidity < 40) return '#3498db';   // Dry — calm blue
  if (humidity < 60) return '#f1c40f';   // Comfortable — warm amber
  return '#e74c3c';                      // Humid — strong red
}
const gaugeChartLocalTemp = new Chart(temperatureLocalGuaugeCtx, {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
      backgroundColor: [
        '#808080', 
        '#808080',
        '#e71831', 
        '#e71831', 
        '#e71831', 
        '#f55807',
        '#f55807', 
        '#fda300', 
        '#fff000', 
        '#3fff03'  
      ],
      borderWidth: 0
    }]
  },
  options: {
    rotation: -90,
    circumference: 180,
    cutout: '80%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    }
  },
  plugins: [{
    id: 'needle',
    afterDatasetDraw(chart) {
      const { ctx, chartArea: { width, height } } = chart;

      const tempValue = document.getElementById('temperature_locale-gaugeValue').textContent;
      const temperature = parseFloat(tempValue) || 0;
      
      const percent = Math.min(Math.max(temperature / 100, 0), 1);
      const angle = Math.PI * percent - Math.PI; 

      const cx = width / 2;
      const cy = height * 0.84; 

      const needleLength = height * 0.3;
      const needleWidth = 6;

      const maxValue = 100;
      const step = 10;
      const steps = maxValue / step;

      const arcRadius = height * 0.3;
      const labelRadius = arcRadius + 25;
      const tickRadiusInner = arcRadius - 10;
      const tickRadiusOuter = arcRadius + 5;

      ctx.font = '12px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw scale markers and labels
      for (let i = 0; i <= steps; i++) {
        const value = i * step;
        const tickPercent = value / maxValue;
        const tickAngle = Math.PI * tickPercent + Math.PI;

        // Tick marks
        const xInner = cx + tickRadiusInner * Math.cos(tickAngle);
        const yInner = cy + tickRadiusInner * Math.sin(tickAngle);
        const xOuter = cx + tickRadiusOuter * Math.cos(tickAngle);
        const yOuter = cy + tickRadiusOuter * Math.sin(tickAngle);

        ctx.beginPath();
        ctx.moveTo(xInner, yInner);
        ctx.lineTo(xOuter, yOuter);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // Labels
        const xLabel = cx + labelRadius * Math.cos(tickAngle);
        const yLabel = cy + labelRadius * Math.sin(tickAngle);
        ctx.fillText(value.toString(), xLabel, yLabel);
      }

      // Draw needle
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Needle shape
      ctx.beginPath();
      ctx.moveTo(0, -needleWidth / 2);
      ctx.lineTo(needleLength, -1);
      ctx.lineTo(needleLength, 1);
      ctx.lineTo(0, needleWidth / 2);
      ctx.closePath();
      ctx.fillStyle = '#d6d6d6ff';
      ctx.fill();

      // Center circle
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Inner center dot
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#666';
      ctx.fill();

      ctx.restore();
    }
  }]
});


const minTemp = 0;
const maxTemp = 80;



function updateGauge(temperature, humidity, pressure, temperature_locale) {
  gaugeChartLocalTemp.update();

  const gaugeValueLocalTempDiv = document.getElementById("temperature_locale-gaugeValue");
  if (gaugeValueLocalTempDiv) {
    gaugeValueLocalTempDiv.textContent = `${temperature_locale} °C`;
  }
}

// Sensor data arrays
let newTempXArray = [];
let newTempYArray = [];
let newHumidityXArray = [];
let newHumidityYArray = [];
let newPressureXArray = [];
let newPressureYArray = [];
let newAltitudeXArray = [];
let newAltitudeYArray = [];
const MAX_GRAPH_POINTS = 12;
let ctr = 0;

// Update functions
function updateBoxes(temperature, humidity, pressure, altitude, state) {
  let temperatureDiv = document.getElementById("temperature");
  let humidityDiv = document.getElementById("humidity");
  let pressureDiv = document.getElementById("pressure");
  let altitudeDiv = document.getElementById("temperature_locale");
  let stateDiv = document.getElementById("state");
  let stateBulb = document.getElementById("state-bulb");

  temperatureDiv.innerHTML = temperature + " C";
  humidityDiv.innerHTML = humidity + " %";
  pressureDiv.innerHTML = pressure + " hPa";
  altitudeDiv.innerHTML = altitude + " C";
  stateDiv.innerHTML = state;

  // Check if the state is active and update the bulb color
  if (state === "INIT" || state === "REINIT" || state === "ENDTREATMENT" || state === "TREATMENT" || "HEATING" ) {
    stateBulb.classList.add("active");
    stateBulb.classList.remove("inactive");
  } else {
    stateBulb.classList.add("inactive");
    stateBulb.classList.remove("active");
  }
}

function createLineChart(ctx, label, minY, maxY, getColorFn) {
 let unit;
  
  // Determine unit based on the label, not the chart (since chart doesn't exist yet)
  if (label.includes('Temperature')) {
    unit = '°C';
  } else if (label.includes('Presure')) {
    unit = 'hPa';
  } else if (label.includes('Humidity')) {
    unit = '%';
  }
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateTimeLabels(),
      datasets: [{
        label,
        data: new Array(4).fill(null),
        borderWidth: 3,
        tension: 0,
        fill: false,
           segment: {
                borderColor: (ctx) => {
                    const value = ctx.p0.parsed.y;
                    return getColorFn(value);
                },
            },
   pointBackgroundColor: new Array(4).fill('transparent').map((v, i, arr) => 
                i === arr.length - 1 ? getColorForValue(0) : 'transparent'),
            pointRadius: new Array(4).fill(0).map((v, i, arr) => 
                i === arr.length - 1 ? 5 : 0),
            pointHoverRadius: new Array(4).fill(0).map((v, i, arr) => 
                i === arr.length - 1 ? 8 : 0)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.parsed.y?.toFixed(1) + '°C' || '',
          }
        }
      },
      scales: {
        y: {
          min: minY,
          max: maxY,
          title: { display: true, text: unit },
          grid: { color: 'rgba(200, 200, 200, 0.2)' }
        },
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: false,
            maxTicksLimit: 5
          }
        }
      }
    }
  });
}

const temperatureHistoryChart = createLineChart(temperatureHistoryCtx, 'Temperature', MIN_TEMP, MAX_TEMP, getColorForValue);
const temperatureLocalChart = createLineChart(temperatureLocalCtx, 'Temperature Local',MIN_TEMP, 200, getColorForLocalValue);
const presurehistoryChart = createLineChart(presureCtx, "Presure", 900, 1100, getColorForPresure )
const humidityHistoryChart = createLineChart(humidityCtx,"Humidity", 0, 100, getColorForHumidity )
// Data Management
function updateLineChart(chart, newValue) {
  chart.data.datasets[0].data.shift();
  chart.data.datasets[0].data.push(parseFloat(newValue));
  chart.data.labels = generateTimeLabels();
  
 let unit;
  let colorFn;
  
  if (chart === temperatureHistoryChart || chart === temperatureLocalChart) {
    unit = '°C';
    colorFn = chart === temperatureHistoryChart ? getColorForValue : getColorForLocalValue;
  } else if (chart === presurehistoryChart) {
    unit = 'hPa';
    colorFn = getColorForPresure;
  } else if (chart === humidityHistoryChart) {
    unit = '%';
    colorFn = getColorForHumidity;
  }
  // Last point colored, others transparent
  chart.data.datasets[0].pointBackgroundColor = 
    chart.data.datasets[0].data.map((v, i, arr) => i === arr.length - 1 ? "transparent" : 'transparent');
  
    let viewDiv;
  if (chart === temperatureHistoryChart) {
    viewDiv = document.getElementById("temperature-history-view");
  } else if (chart === temperatureLocalChart) {
    viewDiv = document.getElementById("temperature_locale-history-view");
  } else if (chart === presurehistoryChart){
    viewDiv = document.getElementById("presure-history-view");
  }else if (chart === humidityHistoryChart){
    viewDiv = document.getElementById("humidity-history-view")
  }
  
  if (viewDiv) {
    viewDiv.textContent = `${newValue} ${unit}`;
  }
  chart.update('none');


}

function updateGaugeValue(chart, value, valueElementId) {
  chart.update();
  const el = document.getElementById(valueElementId);
  if (el) el.textContent = `${value} °C`;
}

function updateSensorReadings() {
    fetch(`http://192.168.1.16:3005/sensorReadings`)
        .then((response) => response.json())
        .then((jsonResponse) => {
                let temperature = jsonResponse.temperature.toFixed(2);
      let humidity = jsonResponse.humidity.toFixed(2);
      let pressure = jsonResponse.pressure.toFixed(2);
      let temperature_locale = jsonResponse.temperature_locale.toFixed(2);
      let state = jsonResponse.state

            updateBoxes(temperature, humidity, pressure, temperature_locale, state);
            updateGauge(temperature, humidity, pressure, temperature_locale);
               updateLineChart(temperatureHistoryChart, temperature);
      updateLineChart(temperatureLocalChart, temperature_locale);
      updateLineChart(presurehistoryChart, pressure)
      updateLineChart(humidityHistoryChart, humidity)


        });
}

    (function loop() {
        setTimeout(() => {
            updateSensorReadings();
            loop();
        }, 1000);
    })();




