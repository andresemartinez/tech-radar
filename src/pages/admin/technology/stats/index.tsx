import { Button } from '@mui/material';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import { NextPageWithLayout } from '~/pages/_app';
import { RouterInput, trpc } from '~/utils/trpc';

type TechStatsPercentageQuery = RouterInput['techStats']['percentage'];

const TechStatsAdminPage: NextPageWithLayout = () => {
  const [techStatsQuery, setTechStatsQuery] =
    useState<TechStatsPercentageQuery>();

  const { data: technologies } = trpc.technology.all.useQuery();

  return (
    <div className="flex flex-col">
      {technologies && (
        <SearchForm
          technologies={technologies}
          onSearch={(query) => setTechStatsQuery(query)}
        />
      )}
      {techStatsQuery && (
        <div className="flex flex-row">
          <TechStats query={techStatsQuery} />
          <div className="w-[800px] h-[1000px]">
            <TechTrendChart query={{ techId: techStatsQuery.id }} />
          </div>
        </div>
      )}
    </div>
  );
};

type SearchFormProps = {
  technologies: { id: string; name: string; [key: string]: any }[];
  onSearch: (query: TechStatsPercentageQuery) => void;
};

const SearchForm = ({ technologies, onSearch }: SearchFormProps) => {
  const { control, handleSubmit } = useForm<{
    tech: { id: string; name: string };
  }>();

  return (
    <form onSubmit={handleSubmit((data) => onSearch({ id: data.tech.id }))}>
      <div className="flex flex-col pb-2">
        <Autocomplete
          className="flex-grow basis-1 mr-3"
          name="tech"
          control={control}
          required
          options={technologies}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </div>

      <div className="flex justify-start pt-5">
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
};

type TechStatsProps = {
  query: TechStatsPercentageQuery;
};

const TechStats = ({ query }: TechStatsProps) => {
  const { data: percentage } = trpc.techStats.percentage.useQuery(query);
  const { data: level } = trpc.techStats.level.useQuery(query);

  return (
    <div className="flex flex-col">
      <div>
        <span>
          Percentage: {percentage?.skillPercentage}% (
          {percentage?.skilledProfessionals}/{percentage?.totalProfessionals})
        </span>
      </div>
      <div>
        <span>
          Level: {level?.name} ({level?.weight}/{level?.maxWeight})
        </span>
      </div>
    </div>
  );
};

type TechTrendChartProps = {
  query: {
    techId: string;
  };
};

const TechTrendChart = ({ query }: TechTrendChartProps) => {
  const { data: techTrend } = trpc.techStats.chart.trend.useQuery(query);

  return (
    <>
      {techTrend && (
        <Line
          data={techTrend.data}
          options={{
            scales: {
              x: {
                type: 'time',
                ticks: {
                  source: 'auto',
                },
                time: {
                  minUnit: 'minute',

                  displayFormats: {
                    minute: 'HH:mm',
                    hour: 'dd/MM HH:mm',
                    day: 'dd/MM',
                    week: 'dd/MM',
                    month: 'MMMM yyyy',
                    quarter: 'MMMM yyyy',
                    year: 'yyyy',
                  },
                },
              },
            },
          }}
        />
      )}
    </>
  );
};

TechStatsAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default TechStatsAdminPage;
