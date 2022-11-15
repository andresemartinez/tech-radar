import { Button } from '@mui/material';
import { ChartOptions } from 'chart.js';
import { t } from 'i18next';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import { NextPageWithLayout } from '~/pages/_app';
import { RouterInput, trpc } from '~/utils/trpc';

type TechStatsPercentageQuery = RouterInput['techStats']['percentage'];
type TechStatsTrendQuery = RouterInput['techStats']['chart']['trend'];

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
            <TechTrendChart query={techStatsQuery} />
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
  const { t: tc } = useTranslation();
  const { t: tb } = useTranslation('button');
  const { control, handleSubmit } = useForm<{
    tech: { id: string; name: string };
  }>();

  return (
    <form onSubmit={handleSubmit((data) => onSearch({ techId: data.tech.id }))}>
      <div className="flex flex-col pb-2">
        <Autocomplete
          className="flex-grow basis-1 mr-3"
          name="tech"
          label={tc('technology')}
          control={control}
          required
          options={technologies}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </div>

      <div className="flex justify-start pt-5">
        <Button type="submit">{tb('search')}</Button>
      </div>
    </form>
  );
};

type TechStatsProps = {
  query: TechStatsPercentageQuery;
};

const TechStats = ({ query }: TechStatsProps) => {
  const { t: tc } = useTranslation();
  const { data: percentage } = trpc.techStats.percentage.useQuery(query);
  const { data: level } = trpc.techStats.level.useQuery(query);

  return (
    <div className="flex flex-col">
      <div>
        <span>
          {tc('percentage')}: {percentage?.skillPercentage}% (
          {percentage?.skilledProfessionals}/{percentage?.totalProfessionals})
        </span>
      </div>
      <div>
        <span>
          {tc('techSkillLevel_short')}: {level?.name} ({level?.weight}/
          {level?.maxWeight})
        </span>
      </div>
    </div>
  );
};

type TechTrendChartProps = {
  query: TechStatsTrendQuery;
};

const TechTrendChart = ({ query }: TechTrendChartProps) => {
  const { data: techTrend } = trpc.techStats.chart.trend.useQuery(query);
  const { data: levels } = trpc.techSkillLevel.all.useQuery();

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      scales: {
        xAxis: {
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
        yAxis: {
          type: 'linear',
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            callback: (label) => {
              const level = levels?.find((level) => level.weight === label);
              return level ? `${level?.name} - ${label}` : label;
            },
          },
        },
      },
    }),
    [levels],
  );

  return <>{techTrend && <Line data={techTrend.data} options={options} />}</>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const serverSideTranslation = locale
    ? await serverSideTranslations(locale, [
        ...AdminLayout.namespacesRequired,
        'common',
        'button',
      ])
    : {};

  return {
    props: {
      ...serverSideTranslation,
    },
  };
};

TechStatsAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default TechStatsAdminPage;
