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

const formFieldByAngularAxisType: {
  [key in TechRadarAngularAxisType]: keyof TechRadarCreateMutation;
} = {
  [TechRadarAngularAxisType.category]: 'techCategories',
  [TechRadarAngularAxisType.technology]: 'technologies',
};

const formFieldByRadialAxisType: {
  [key in Exclude<
    TechRadarRadialAxisType,
    'company'
  >]: keyof TechRadarCreateMutation;
} = {
  [TechRadarRadialAxisType.professional]: 'professionals',
};

const TechRadarAdminPage: NextPageWithLayout = () => {
  const { data: session } = useSession();
  const trpcUtils = trpc.useContext();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: professional } = trpc.professional.byUserId.useQuery(
    {
      userId: session?.user?.id ?? '',
    },
    { enabled: Boolean(session?.user?.id) },
  );
  const { data: techRadars } = trpc.techRadar.all.useQuery();
  const { data: technologies } = trpc.technology.all.useQuery();
  const { data: categories } = trpc.techCategory.all.useQuery();
  const { data: professionals } = trpc.professional.all.useQuery();

  const createTechRadar = trpc.techRadar.create.useMutation({
    async onSuccess() {
      trpcUtils.techRadar.invalidate();
    },
  });

  const { control, handleSubmit } = useForm<{
    name: string;
    technologies: { id: string; name: string }[];
    owner: string;
    angularAxis: TechRadarAngularAxisType;
    radialAxis: TechRadarRadialAxisType;
    professionals: { id: string; name: string }[];
    techCategories: { id: string; name: string }[];
  }>({
    defaultValues: {
      professionals: [],
      techCategories: [],
      technologies: [],
    },
  });

  const angularAxisType = useWatch<TechRadarAngularAxisType>({
    control,
    name: 'angularAxis',
  });
  const radialAxisType = useWatch<TechRadarRadialAxisType>({
    control,
    name: 'radialAxis',
  });

  return (
    <>
      <div className="flex flex-col">
        {techRadars?.map((techRadar) => (
          <TechRadarTableRow key={techRadar.id} techRadar={techRadar} />
        ))}
      </div>
      <div>
        <Button onClick={() => setModalOpen(true)}>Create Tech Radar</Button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <form
            onSubmit={handleSubmit((data) => {
              createTechRadar.mutateAsync({
                data: {
                  ...data,
                  owner: professional?.id ?? '',
                  professionals: data.professionals.map(
                    (professional) => professional.id,
                  ),
                  technologies: data.technologies.map(
                    (technology) => technology.id,
                  ),
                  techCategories: data.techCategories.map(
                    (techCategory) => techCategory.id,
                  ),
                },
              });
            })}
          >
            <div className="flex flex-col">
              <div className="flex flex-row">
                <TextInput name="name" control={control} required />
              </div>

              <div className="flex flex-row">
                <div className="flex flex-col pr-2 pl-2 flex-grow">
                  <Autocomplete
                    name="angularAxis"
                    label="Angular Axis"
                    control={control}
                    required
                    options={Object.values(TechRadarAngularAxisType)}
                    getOptionLabel={(option) =>
                      `${option
                        .substring(0, 1)
                        .toUpperCase()}${option.substring(1)}`
                    }
                    isOptionEqualToValue={(option, value) => option === value}
                  />

                  {categories !== undefined &&
                    technologies !== undefined &&
                    angularAxisType !== undefined && (
                      <Autocomplete
                        name={formFieldByAngularAxisType[angularAxisType]}
                        label="Blah"
                        control={control}
                        required
                        multiple
                        options={
                          angularAxisType === TechRadarAngularAxisType.category
                            ? categories
                            : technologies
                        }
                        getOptionLabel={(option) => option.name ?? ''}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                      />
                    )}
                </div>

                <div className="flex flex-col pr-2 pl-2 flex-grow">
                  <Autocomplete
                    name="radialAxis"
                    label="Radial Axis"
                    control={control}
                    required
                    options={Object.values(TechRadarRadialAxisType)}
                    getOptionLabel={(option) =>
                      `${option
                        .substring(0, 1)
                        .toUpperCase()}${option.substring(1)}`
                    }
                    isOptionEqualToValue={(option, value) => option === value}
                  />

                  {professionals !== undefined &&
                    radialAxisType !== undefined &&
                    radialAxisType !== TechRadarRadialAxisType.company && (
                      <Autocomplete
                        name={formFieldByRadialAxisType[radialAxisType]}
                        label="Professionals"
                        control={control}
                        required
                        multiple
                        options={professionals}
                        getOptionLabel={(option) => option.name ?? ''}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                      />
                    )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5">
              <Button className="pr-3" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      </Modal>
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
        <div>{techRadar.name}</div>
        <div>{techRadar.owner}</div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <Radar data={techRadarDataset.data ?? { labels: [], datasets: [] }} />
        </div>
      </Modal>
    </>
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
