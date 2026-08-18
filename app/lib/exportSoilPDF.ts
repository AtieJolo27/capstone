import { getSoilHistory, SoilHistoryRow } from '@/lib/getHistory';
import { computeOverallScore } from '@/lib/soilHealthScore';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function getHealthLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

function getHealthColor(score: number): string {
  if (score >= 80) return '#16A34A';
  if (score >= 60) return '#EAB308';
  if (score >= 40) return '#F97316';
  return '#DC2626';
}

function formatNumber(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return '-';
  }

  return number.toFixed(1);
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function exportSoilHistoryPDF() {

  const history = await getSoilHistory(30);

  if (!history || history.length === 0) {
    throw new Error('No soil history available.');
  }

  // -----------------------------------------
  // HEALTH SCORES
  // -----------------------------------------

  const healthScores = history.map((row) =>
    computeOverallScore(row)
  );

  const latestRow =
    history[history.length - 1];

  const latestScore =
    healthScores[healthScores.length - 1];

  const healthLabel =
    getHealthLabel(latestScore);

  const healthColor =
    getHealthColor(latestScore);

  // -----------------------------------------
  // HEALTH HISTORY TABLE
  // -----------------------------------------

  const healthRows = history
    .map((row: SoilHistoryRow) => {

      const score = computeOverallScore(row);

      return `
        <tr>
          <td>${formatDate(row.created_at)}</td>

          <td>
            <span
              style="
                color: ${getHealthColor(score)};
                font-weight: bold;
              "
            >
              ${score}%
            </span>
          </td>

          <td>${getHealthLabel(score)}</td>
        </tr>
      `;
    })
    .join('');

  // -----------------------------------------
  // NUTRIENT HISTORY
  // -----------------------------------------

  const nutrientRows = history
    .map((row: SoilHistoryRow) => {

      return `
        <tr>
          <td>${formatDate(row.created_at)}</td>

          <td>${formatNumber(row.nitrogen)}</td>

          <td>${formatNumber(row.phosphorus)}</td>

          <td>${formatNumber(row.potassium)}</td>

          <td>${formatNumber(row.ph)}</td>

          <td>${formatNumber(row.soil_moisture)}%</td>

          <td>${formatNumber(row.humidity)}%</td>

          <td>${formatNumber(row.soil_temperature)}°C</td>

          <td>${formatNumber(row.air_temperature)}°C</td>
        </tr>
      `;
    })
    .join('');

  // -----------------------------------------
  // HTML
  // -----------------------------------------

  const html = `
    <!DOCTYPE html>

    <html>

      <head>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>

          @page {
            margin: 30px;
          }

          body {
            font-family: Arial, sans-serif;
            color: #222;
            padding: 20px;
          }

          h1 {
            text-align: center;
            color: #0D5E33;
            margin-bottom: 5px;
          }

          h2 {
            color: #0D5E33;
            margin-top: 30px;
            border-bottom: 2px solid #0D5E33;
            padding-bottom: 6px;
          }

          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 25px;
          }

          .health-card {
            text-align: center;
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            background-color: #f0fdf4;
            border: 2px solid ${healthColor};
          }

          .health-score {
            font-size: 42px;
            font-weight: bold;
            color: ${healthColor};
          }

          .health-label {
            font-size: 20px;
            font-weight: bold;
            color: ${healthColor};
            margin-top: 5px;
          }

          .generated {
            text-align: center;
            font-size: 11px;
            color: #777;
          }

          .latest-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          .latest-table td {
            border-bottom: 1px solid #ddd;
            padding: 9px;
          }

          .latest-table td:first-child {
            font-weight: bold;
            width: 50%;
          }

          table.history {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 9px;
          }

          table.history th {
            background-color: #0D5E33;
            color: white;
            padding: 7px;
          }

          table.history td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: center;
          }

          table.history tr:nth-child(even) {
            background-color: #f5f5f5;
          }

          .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 10px;
          }

        </style>

      </head>

      <body>

        <!-- TITLE -->

        <h1>
          Soil Quality Report
        </h1>

        <div class="subtitle">
          Soil Monitoring System
        </div>

        <div class="generated">
          Generated: ${new Date().toLocaleString()}
        </div>


        <!-- ================================= -->
        <!-- OVERALL HEALTH -->
        <!-- ================================= -->

        <h2>
          Overall Soil Health
        </h2>

        <div class="health-card">

          <div class="health-score">
            ${latestScore}%
          </div>

          <div class="health-label">
            ${healthLabel}
          </div>

        </div>


        <!-- ================================= -->
        <!-- LATEST READING -->
        <!-- ================================= -->

        <h2>
          Latest Soil Reading
        </h2>

        <table class="latest-table">

          <tr>
            <td>Date</td>
            <td>${formatDate(latestRow.created_at)}</td>
          </tr>

          <tr>
            <td>Soil pH</td>
            <td>${formatNumber(latestRow.ph)}</td>
          </tr>

          <tr>
            <td>Nitrogen</td>
            <td>${formatNumber(latestRow.nitrogen)} mg/kg</td>
          </tr>

          <tr>
            <td>Phosphorus</td>
            <td>${formatNumber(latestRow.phosphorus)} mg/kg</td>
          </tr>

          <tr>
            <td>Potassium</td>
            <td>${formatNumber(latestRow.potassium)} mg/kg</td>
          </tr>

          <tr>
            <td>Soil Moisture</td>
            <td>${formatNumber(latestRow.soil_moisture)}%</td>
          </tr>

          <tr>
            <td>Humidity</td>
            <td>${formatNumber(latestRow.humidity)}%</td>
          </tr>

          <tr>
            <td>Soil Temperature</td>
            <td>${formatNumber(latestRow.soil_temperature)}°C</td>
          </tr>

          <tr>
            <td>Air Temperature</td>
            <td>${formatNumber(latestRow.air_temperature)}°C</td>
          </tr>

        </table>


        <!-- ================================= -->
        <!-- HEALTH HISTORY -->
        <!-- ================================= -->

        <h2>
          Soil Health History
        </h2>

        <table class="history">

          <tr>
            <th>Date</th>
            <th>Score</th>
            <th>Status</th>
          </tr>

          ${healthRows}

        </table>


        <!-- ================================= -->
        <!-- NUTRIENT HISTORY -->
        <!-- ================================= -->

        <h2>
          Nutrient & Soil History
        </h2>

        <table class="history">

          <tr>
            <th>Date</th>
            <th>N</th>
            <th>P</th>
            <th>K</th>
            <th>pH</th>
            <th>Moisture</th>
            <th>Humidity</th>
            <th>Soil Temp</th>
            <th>Air Temp</th>
          </tr>

          ${nutrientRows}

        </table>


        <div class="footer">
          Generated by Soil Quality Monitoring System
        </div>

      </body>

    </html>
  `;

  // -----------------------------------------
  // GENERATE PDF
  // -----------------------------------------

  const { uri } = await Print.printToFileAsync({
    html,
  });

  // -----------------------------------------
  // SHARE / SAVE
  // -----------------------------------------

  if (await Sharing.isAvailableAsync()) {

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Export Soil Quality Report',
      UTI: 'com.adobe.pdf',
    });

  }

  return uri;
}