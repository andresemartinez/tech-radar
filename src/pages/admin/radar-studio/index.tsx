import {
  Delete as DeleteIcon,
  WifiTethering as EnableRadialAxisIcon,
  WifiTetheringOff as DisableRadialAxisIcon,
} from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import {
  TechRadarAngularAxisType,
  TechRadarRadialAxisType,
} from '@prisma/client';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Control,
  useFieldArray,
  UseFieldArrayUpdate,
  useForm,
  useWatch,
} from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import Select from '~/components/form/Select';
import TextInput from '~/components/form/TextInput';
import { NextPageWithLayout } from '~/pages/_app';
import { capitalize } from '~/utils/string';
import { RouterOutput, trpc } from '~/utils/trpc';

type Technology = RouterOutput['technology']['all'][number];
type TechCategory = RouterOutput['techCategory']['all'][number];
type Professional = RouterOutput['professional']['all'][number];

type TechRadarConfig = {
  angularAxisType: TechRadarAngularAxisType;
  technologies: { id: string; name: string }[];
  techCategories: { id: string; name: string }[];
  radialAxes: {
    name: string;
    radialAxisType: TechRadarRadialAxisType;
    professionals: { id: string; name: string }[];
    disabled: boolean;
  }[];
};

const RadarStudioAdminPage: NextPageWithLayout = () => {
  const [techRadar, setTechRadar] = useState<TechRadarConfig | null>(null);
  return (
    <div className="flex flex-row w-full  h-[calc(100vh-56px)] p-5">
      <RadarStudioControls onChange={setTechRadar} />
      <div className="self-center w-[2px] h-5/6 bg-gray-300"></div>
      <RadarStudioPreview techRadar={techRadar} />
    </div>
  );
};

type RadarStudioControlsProps = {
  onChange: (techRadars: TechRadarConfig) => void;
};

const RadarStudioControls = ({ onChange }: RadarStudioControlsProps) => {
  const { data: technologies } = trpc.technology.all.useQuery();
  const { data: techCategories } = trpc.techCategory.all.useQuery();
  const { data: professionals } = trpc.professional.all.useQuery();

  return (
    <TechRadarForm
      technologies={technologies ?? []}
      techCategories={techCategories ?? []}
      professionals={professionals ?? []}
      onSubmit={onChange}
    />
  );
};

type TechRadarFormProps = {
  technologies: Technology[];
  techCategories: TechCategory[];
  professionals: Professional[];
  onSubmit: (techRadar: TechRadarConfig) => void;
};

const TechRadarForm = ({
  technologies,
  techCategories,
  professionals,
  onSubmit,
}: TechRadarFormProps) => {
  const { control, handleSubmit, watch } = useForm<TechRadarConfig>({
    defaultValues: {
      angularAxisType: TechRadarAngularAxisType.technology,
      techCategories: [],
      technologies: [],
      radialAxes: [
        {
          name: 'Radar 1',
          radialAxisType: TechRadarRadialAxisType.company,
          professionals: [],
          disabled: false,
        },
      ],
    },
  });

  useEffect(() => {
    const subscription = watch(() => {
      handleSubmit((data) => onSubmit(data))();
    });
    return () => subscription.unsubscribe();
  }, [onSubmit, watch, handleSubmit]);

  return (
    <form
      className="flex flex-col w-1/2"
      onSubmit={handleSubmit((data) => onSubmit(data))}
    >
      <TechRadarAngularAxisForm
        control={control}
        technologies={technologies}
        techCategories={techCategories}
      />
      <TechRadarRadialAxesForm
        control={control}
        professionals={professionals}
      />
    </form>
  );
};

type TechRadarAngularAxisFormProps = {
  control: Control<TechRadarConfig>;
  techCategories: TechCategory[];
  technologies: Technology[];
};

const TechRadarAngularAxisForm = ({
  control,
  techCategories,
  technologies,
}: TechRadarAngularAxisFormProps) => {
  return (
    <div className="flex flex-row pt-2 pb-4 pr-5">
      <AngularAxisTypeInput control={control} />

      <AngularAxisInput
        control={control}
        techCategories={techCategories}
        technologies={technologies}
      />
    </div>
  );
};

type AngularAxisTypeInputProps = {
  control: Control<TechRadarConfig>;
};

const AngularAxisTypeInput = ({ control }: AngularAxisTypeInputProps) => {
  return (
    <Select
      className="pr-2 w-1/3"
      name="angularAxisType"
      label="Angular Axis"
      control={control}
      required
      options={Object.values(TechRadarAngularAxisType)}
      getOptionLabel={(option) => (option ? capitalize(option) : '')}
      getOptionValue={(option) => option}
    />
  );
};

type AngularAxisInputProps = {
  control: Control<TechRadarConfig>;
  techCategories: TechCategory[];
  technologies: Technology[];
};

const AngularAxisInput = ({
  control,
  techCategories,
  technologies,
}: AngularAxisInputProps) => {
  const angularAxisType = useWatch({
    control,
    name: 'angularAxisType',
  });

  return (
    <>
      <Autocomplete
        className={`pl-2 w-2/3 ${
          angularAxisType === TechRadarAngularAxisType.category ? '' : 'hidden'
        }`}
        name="techCategories"
        label="Categories"
        control={control}
        required={angularAxisType === TechRadarAngularAxisType.category}
        multiple
        minLength={
          angularAxisType === TechRadarAngularAxisType.category ? 3 : 0
        }
        options={techCategories}
        getOptionLabel={(option) => option.name ?? ''}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />

      <Autocomplete
        className={`pl-2 w-2/3 ${
          angularAxisType === TechRadarAngularAxisType.technology
            ? ''
            : 'hidden'
        }`}
        name="technologies"
        label="Technologies"
        control={control}
        required={angularAxisType === TechRadarAngularAxisType.technology}
        multiple
        minLength={
          angularAxisType === TechRadarAngularAxisType.technology ? 3 : 0
        }
        options={technologies}
        getOptionLabel={(option) => option.name ?? ''}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </>
  );
};

type TechRadarRadialAxesFormProps = {
  control: Control<TechRadarConfig>;
  professionals: Professional[];
};

const TechRadarRadialAxesForm = ({
  control,
  professionals,
}: TechRadarRadialAxesFormProps) => {
  const radarCounter = useRef(2);
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'radialAxes',
  });

  return (
    <>
      <div className="pt-4 pb-2 overflow-y-auto">
        <div className="flex flex-col pr-5">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col py-2">
              <div className="flex flex-row pb-2">
                <TextInput
                  className="w-2/3"
                  name={`radialAxes.${index}.name`}
                  label="Name"
                  control={control}
                />
                <div className="flex flex-row justify-end w-1/3">
                  <ToggleRadialAxisButton
                    control={control}
                    index={index}
                    update={update}
                  />
                  <IconButton
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
              <TechRadarRadialAxisForm
                control={control}
                index={index}
                professionals={professionals}
              />
            </div>
          ))}
        </div>
      </div>
      <Button
        onClick={() =>
          append({
            name: `Radar ${radarCounter.current++}`,
            radialAxisType: TechRadarRadialAxisType.company,
            professionals: [],
            disabled: false,
          })
        }
      >
        Add Axis
      </Button>
    </>
  );
};

type ToggleRadialAxisButtonProps = {
  control: Control<TechRadarConfig>;
  index: number;
  update: UseFieldArrayUpdate<TechRadarConfig, 'radialAxes'>;
};

const ToggleRadialAxisButton = ({
  control,
  index,
  update,
}: ToggleRadialAxisButtonProps) => {
  const radialAxis = useWatch({
    control,
    name: `radialAxes.${index}`,
  });

  return radialAxis.disabled ? (
    <IconButton
      onClick={() => update(index, { ...radialAxis, disabled: false })}
    >
      <EnableRadialAxisIcon />
    </IconButton>
  ) : (
    <IconButton
      onClick={() => update(index, { ...radialAxis, disabled: true })}
    >
      <DisableRadialAxisIcon />
    </IconButton>
  );
};

type TechRadarRadialAxisFormProps = {
  control: Control<TechRadarConfig>;
  index: number;
  professionals: Professional[];
};

const TechRadarRadialAxisForm = ({
  control,
  index,
  professionals,
}: TechRadarRadialAxisFormProps) => {
  return (
    <div className="flex flex-row pt-2">
      <RadialAxisTypeInput control={control} index={index} />

      <RadialAxisInput
        control={control}
        index={index}
        professionals={professionals}
      />
    </div>
  );
};

type RadialAxisTypeInputProps = {
  control: Control<TechRadarConfig>;
  index: number;
};

const RadialAxisTypeInput = ({ control, index }: RadialAxisTypeInputProps) => {
  return (
    <Select
      className="pr-2 w-1/3"
      name={`radialAxes.${index}.radialAxisType`}
      label="Radial Axis"
      control={control}
      required
      options={Object.values(TechRadarRadialAxisType)}
      getOptionLabel={(option) => (option ? capitalize(option) : '')}
      getOptionValue={(option) => option}
    />
  );
};

type RadialAxisInputProps = {
  control: Control<TechRadarConfig>;
  index: number;
  professionals: Professional[];
};

const RadialAxisInput = ({
  control,
  index,
  professionals,
}: RadialAxisInputProps) => {
  const radialAxisType = useWatch({
    control,
    name: `radialAxes.${index}.radialAxisType`,
  });

  return (
    <Autocomplete
      className="pl-2 w-2/3"
      name={`radialAxes.${index}.professionals`}
      label="Professionals"
      control={control}
      required={radialAxisType === TechRadarRadialAxisType.professional}
      disabled={radialAxisType !== TechRadarRadialAxisType.professional}
      multiple
      options={professionals}
      getOptionLabel={(option) => option.name ?? ''}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

type RadarStudioPreviewProps = {
  techRadar: TechRadarConfig | null;
};

const RadarStudioPreview = ({ techRadar }: RadarStudioPreviewProps) => {
  let preview: JSX.Element;

  if (techRadar === null) {
    preview = <span>Complete the form to generate the radar</span>;
  } else if (techRadar.radialAxes.every((radialAxis) => radialAxis.disabled)) {
    preview = <span>At least one radial axis should be enabled</span>;
  } else {
    preview = <TechRadar techRadar={techRadar} />;
  }

  return <div className="pl-5 w-1/2">{preview}</div>;
};

type TechRadarProps = {
  techRadar: TechRadarConfig;
};

const TechRadar = ({ techRadar }: TechRadarProps) => {
  const previewQuery = useMemo(
    () => ({
      ...techRadar,
      technologies: techRadar.technologies.map((technology) => technology.id),
      techCategories: techRadar.techCategories.map(
        (techCategory) => techCategory.id,
      ),
      radialAxes: techRadar.radialAxes
        .filter((radialAxis) => !radialAxis.disabled)
        .map((radialAxis) => ({
          ...radialAxis,
          professionals: radialAxis.professionals.map(
            (professional) => professional.id,
          ),
        })),
    }),
    [techRadar],
  );

  const { data: techRadarDataset } = trpc.chart.techRadar.preview.useQuery(
    previewQuery,
    { enabled: previewQuery !== null },
  );

  return (
    <Radar
      data={techRadarDataset ?? { labels: [], datasets: [] }}
      options={{
        maintainAspectRatio: false,
      }}
    />
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const serverSideTranslation = locale
    ? await serverSideTranslations(locale, [
        ...AdminLayout.namespacesRequired,
        'button',
      ])
    : {};

  return {
    props: {
      ...serverSideTranslation,
    },
  };
};

RadarStudioAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default RadarStudioAdminPage;
