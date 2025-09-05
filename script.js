let vendorsData = [];
let barChart, pieChart;

async function loadData() {
  const response = await fetch("vendors.json");
  vendorsData = await response.json();

  const vendorSelect = document.getElementById("vendorSelect");
  vendorsData.forEach(v => {
    const option = document.createElement("option");
    option.value = v.Vendor;
    option.textContent = v.Vendor;
    vendorSelect.appendChild(option);
  });

  updateDashboard(vendorsData[0].Vendor);
}

function updateDashboard(vendorName) {
  const vendor = vendorsData.find(v => v.Vendor === vendorName);

  // KPIs
  document.getElementById("kpiDelivery").textContent = vendor.OnTimeDelivery + "%";
  document.getElementById("kpiQuality").textContent = vendor.QualityScore + "%";
  document.getElementById("kpiCost").textContent = vendor.CostVariance + "%";
  document.getElementById("kpiOrders").textContent = vendor.Orders;

  // Bar Chart
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["On-Time Delivery", "Quality Score", "Cost Variance"],
      datasets: [{
        label: vendor.Vendor,
        data: [vendor.OnTimeDelivery, vendor.QualityScore, vendor.CostVariance],
        backgroundColor: ["#27ae60", "#2980b9", "#e74c3c"],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 14 } } },
        y: { ticks: { font: { size: 14 } } }
      }
    }
  });

  // Pie Chart
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: vendorsData.map(v => v.Vendor),
      datasets: [{
        data: vendorsData.map(v => v.Orders),
        backgroundColor: ["#1abc9c", "#3498db", "#9b59b6", "#f39c12", "#e74c3c"],
        borderWidth: 1,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 14 } } }
      }
    }
  });
}

// Event Listeners
document.getElementById("vendorSelect").addEventListener("change", e => {
  updateDashboard(e.target.value);
});

document.getElementById("darkModeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

document.getElementById("downloadExcel").addEventListener("click", () => {
  let csv = "Vendor,OnTimeDelivery,QualityScore,CostVariance,Orders\n";
  vendorsData.forEach(v => {
    csv += `${v.Vendor},${v.OnTimeDelivery},${v.QualityScore},${v.CostVariance},${v.Orders}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "vendor_performance.csv";
  link.click();
});

document.getElementById("downloadPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text("Vendor Performance Report", 20, 20);
  vendorsData.forEach((v, i) => {
    pdf.text(`${v.Vendor}: Delivery ${v.OnTimeDelivery}%, Quality ${v.QualityScore}%, Cost ${v.CostVariance}%, Orders ${v.Orders}`, 20, 40 + i * 10);
  });
  pdf.save("vendor_performance.pdf");
});

loadData();
