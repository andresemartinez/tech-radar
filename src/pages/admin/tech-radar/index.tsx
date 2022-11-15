import { Button } from '@mui/material';
import {
  TechRadarAngularAxisType,
  TechRadarRadialAxisType,
} from '@prisma/client';
import { GetStaticProps } from 'next';
import { useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { useForm, useWatch } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import TextInput from '~/components/form/TextInput';
import Modal from '~/components/Modal';
import { NextPageWithLayout } from '~/pages/_app';
import { RouterInput, RouterOutput, trpc } from '~/utils/trpc';

type TechRadarCreateMutation = RouterInput['techRadar']['create']['data'];
type TechRadar = RouterOutput['techRadar']['all'][number];
type Technology = RouterOutput['technology']['all'][number];
type TechCategory = RouterOutput['techCategory']['all'][number];
type Professional = RouterOutput['professional']['all'][number];

const TechRadarAdminPage: NextPageWithLayout = () => {
  const { data: techRadars } = trpc.techRadar.all.useQuery();

  return (
    <>
      <div className="flex flex-col p-5">
        {techRadars?.map((techRadar) => (
          <TechRadarTableRow key={techRadar.id} techRadar={techRadar} />
        ))}
      </div>
      <div className="px-3">
        <CreateTechRadarButton />
      </div>
    </>
  );
};

type TechRadarTableRowProps = {
  techRadar: TechRadar;
};

const TechRadarTableRow = ({ techRadar }: TechRadarTableRowProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const techRadarDataset = trpc.chart.techRadar.byId.useQuery(
    { id: techRadar.id },
    { enabled: modalOpen },
  );

  return (
    <>
      <div className="flex flex-row" onClick={() => setModalOpen(true)}>
        <div className="pr-2">{techRadar.name}</div>
        <div className="pl-2">{techRadar.owner}</div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <Radar data={techRadarDataset.data ?? { labels: [], datasets: [] }} />
        </div>
      </Modal>
    </>
  );
};

const CreateTechRadarButton = () => {
  const trpcUtils = trpc.useContext();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: technologies } = trpc.technology.all.useQuery();
  const { data: techCategories } = trpc.techCategory.all.useQuery();
  const { data: professionals } = trpc.professional.all.useQuery();

  const createTechRadar = trpc.techRadar.create.useMutation({
    async onSuccess() {
      trpcUtils.techRadar.invalidate();
    },
  });

  return (
    <>
      <div>
        <Button onClick={() => setModalOpen(true)}>Create Tech Radar</Button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <CreateTechRadarForm
            technologies={technologies ?? []}
            techCategories={techCategories ?? []}
            professionals={professionals ?? []}
            onCancel={() => setModalOpen(false)}
            onSubmit={(techRadar) => {
              createTechRadar.mutateAsync({ data: techRadar });
              setModalOpen(false);
            }}
          />
        </div>
      </Modal>
    </>
  );
};

type CreateTechRadarFormProps = {
  technologies: Technology[];
  techCategories: TechCategory[];
  professionals: Professional[];
  onCancel: () => void;
  onSubmit: (techRadar: TechRadarCreateMutation) => void;
};

const CreateTechRadarForm = ({
  technologies,
  techCategories,
  professionals,
  onCancel,
  onSubmit,
}: CreateTechRadarFormProps) => {
  const { data: session } = useSession();
  const { data: professional } = trpc.professional.byUserId.useQuery(
    {
      userId: session?.user?.id ?? '',
    },
    { enabled: Boolean(session?.user?.id) },
  );

  const { control, handleSubmit } = useForm<{
    name: string;
    technologies: { id: string; name: string }[];
    angularAxis: TechRadarAngularAxisType;
    radialAxis: TechRadarRadialAxisType;
    professionals: { id: string; name: string }[];
    techCategories: { id: string; name: string }[];
  }>({
    defaultValues: {
      name: '',
      professionals: [],
      techCategories: [],
      technologies: [],
    },
  });

  const angularAxisType = useWatch({
    control,
    name: 'angularAxis',
  });
  const radialAxisType = useWatch({
    control,
    name: 'radialAxis',
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          ...data,
          owner: professional?.id ?? '',
          technologies: data.technologies.map((tech) => tech.id),
          techCategories: data.techCategories.map(
            (techCategory) => techCategory.id,
          ),
          professionals: data.professionals.map(
            (professional) => professional.id,
          ),
        }),
      )}
    >
      <div className="flex flex-col">
        <div className="flex flex-row pb-2 flex-grow">
          <TextInput name="name" label="Name" control={control} required />
        </div>

        <div className="flex flex-row pt-2 flex-grow">
          <div className="flex flex-col pr-2 flex-grow">
            <Autocomplete
              className="pb-2"
              name="angularAxis"
              label="Angular Axis"
              control={control}
              required
              options={Object.values(TechRadarAngularAxisType)}
              getOptionLabel={(option) =>
                option
                  ? `${option.substring(0, 1).toUpperCase()}${option.substring(
                      1,
                    )}`
                  : ''
              }
              isOptionEqualToValue={(option, value) => option === value}
            />

            <Autocomplete
              className={`pt-2 ${
                angularAxisType === TechRadarAngularAxisType.category
                  ? ''
                  : 'hidden'
              }`}
              name="techCategories"
              label="Categories"
              control={control}
              required={angularAxisType === TechRadarAngularAxisType.category}
              multiple
              options={techCategories}
              getOptionLabel={(option) => option.name ?? ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Autocomplete
              className={`pt-2 ${
                angularAxisType === TechRadarAngularAxisType.technology
                  ? ''
                  : 'hidden'
              }`}
              name="technologies"
              label="Technologies"
              control={control}
              required={angularAxisType === TechRadarAngularAxisType.technology}
              multiple
              options={technologies}
              getOptionLabel={(option) => option.name ?? ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </div>

          <div className="flex flex-col pl-2 flex-grow">
            <Autocomplete
              className="pb-2"
              name="radialAxis"
              label="Radial Axis"
              control={control}
              required
              options={Object.values(TechRadarRadialAxisType)}
              getOptionLabel={(option) =>
                option
                  ? `${option.substring(0, 1).toUpperCase()}${option.substring(
                      1,
                    )}`
                  : ''
              }
              isOptionEqualToValue={(option, value) => option === value}
            />

            <Autocomplete
              className={`pt-2 ${
                radialAxisType === TechRadarRadialAxisType.professional
                  ? ''
                  : 'hidden'
              }`}
              name="professionals"
              label="Professionals"
              control={control}
              required={radialAxisType === TechRadarRadialAxisType.professional}
              multiple
              options={professionals}
              getOptionLabel={(option) => option.name ?? ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-5">
        <Button className="pr-3" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
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

TechRadarAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default TechRadarAdminPage;
