import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

let isConfigured = false;

export const ensureChartSetup = () => {
  if (isConfigured) {
    return;
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Filler,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
  );

  isConfigured = true;
};
