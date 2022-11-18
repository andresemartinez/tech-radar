import 'chartjs-adapter-date-fns';

import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  TimeScale,
  Filler,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Filler,
);
