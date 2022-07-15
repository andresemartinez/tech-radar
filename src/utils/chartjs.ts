import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(RadialLinearScale, LineElement, PointElement);
