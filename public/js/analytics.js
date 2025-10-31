document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById('analyticsChart').getContext('2d');
  const dataKeySelect = document.getElementById('dataKey');

  let currentKey = defaultKey;

  function getChartData(key) {
    const labels = playersData.map(p => p.username);
    const values = playersData.map(p => p.data[key] ?? 0);
    return { labels, values };
  }

  const initialData = getChartData(currentKey);

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: initialData.labels,
      datasets: [{
        label: currentKey,
        data: initialData.values,
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: { beginAtZero: true },
        x: { ticks: { autoSkip: false } }
      }
    }
  });

  dataKeySelect.addEventListener('change', () => {
    currentKey = dataKeySelect.value;
    const newData = getChartData(currentKey);
    chart.data.datasets[0].label = currentKey;
    chart.data.datasets[0].data = newData.values;
    chart.update();
  });
});
