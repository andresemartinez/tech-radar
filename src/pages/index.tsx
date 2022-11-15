import { Radar } from 'react-chartjs-2';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from './_app';

const IndexPage: NextPageWithLayout = () => {
  const techRadarDataset = trpc.chart.techRadar.default.useQuery();

  return (
    <>
      <h1>Tech radar!</h1>

      <Radar data={techRadarDataset.data ?? { labels: [], datasets: [] }} />
    </>
  );
};

export default IndexPage;
