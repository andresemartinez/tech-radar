import { trpc } from '~/utils/trpc';
import { Radar } from 'react-chartjs-2';

type ProfessionalRadarProps = {
  id: string;
  size: number;
};

const ProfessionalTechRadar = ({ id, size }: ProfessionalRadarProps) => {
  const { data: techRadarDataset } =
    trpc.chart.techRadar.byProfessional.useQuery({ id });

  return (
    <div className={`h-[${size}px] w-[${size}px]`}>
      {techRadarDataset && <Radar data={techRadarDataset} />}
    </div>
  );
};

export default ProfessionalTechRadar;
