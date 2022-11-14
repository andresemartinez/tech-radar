import { Button } from '@mui/material';
import { TechRadarAxisType } from '@prisma/client';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import TextInput from '~/components/form/TextInput';
import Modal from '~/components/Modal';
import { NextPageWithLayout } from '~/pages/_app';
import { RouterInput, trpc } from '~/utils/trpc';

type TechRadarCreateMutation = RouterInput['techRadar']['create']['data'];

const formFieldByAxisType: {
  [key in Exclude<TechRadarAxisType, 'company'>]: keyof TechRadarCreateMutation;
} = {
  [TechRadarAxisType.category]: 'techCategories',
  [TechRadarAxisType.professional]: 'professionals',
  [TechRadarAxisType.technology]: 'technologies',
};

const TechRadarAdminPage: NextPageWithLayout = () => {
  const trpcUtils = trpc.useContext();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: technologies } = trpc.technology.all.useQuery();
  const { data: categories } = trpc.techCategory.all.useQuery();
  const { data: professionals } = trpc.professional.all.useQuery();

  const createTechRadar = trpc.techRadar.create.useMutation({
    async onSuccess() {
      trpcUtils.techRadar.invalidate();
    },
  });

  const { control, handleSubmit } = useForm<TechRadarCreateMutation>({
    defaultValues: {
      professionals: [],
      techCategories: [],
      technologies: [],
    },
  });

  const angularAxisType = useWatch<TechRadarAxisType>({
    control,
    name: 'angularAxis',
  });
  const radialAxisType = useWatch<TechRadarAxisType>({
    control,
    name: 'radialAxis',
  });

  return (
    <>
      <div>
        <Button onClick={() => setModalOpen(true)}>Create Tech Radar</Button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <form
            onSubmit={handleSubmit((data) => {
              createTechRadar.mutateAsync({
                data,
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
                    options={Object.values(TechRadarAxisType)}
                    getOptionLabel={(option) =>
                      `${option
                        .substring(0, 1)
                        .toUpperCase()}${option.substring(1)}`
                    }
                    isOptionEqualToValue={(option, value) => option === value}
                  />

                  {categories !== undefined &&
                    professionals !== undefined &&
                    technologies !== undefined &&
                    angularAxisType !== undefined &&
                    angularAxisType !== TechRadarAxisType.company && (
                      <Autocomplete
                        name={formFieldByAxisType[angularAxisType]}
                        label="Blah"
                        control={control}
                        required
                        multiple
                        options={
                          angularAxisType === TechRadarAxisType.category
                            ? categories
                            : angularAxisType === TechRadarAxisType.professional
                            ? professionals
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
                    options={Object.values(TechRadarAxisType)}
                    getOptionLabel={(option) =>
                      `${option
                        .substring(0, 1)
                        .toUpperCase()}${option.substring(1)}`
                    }
                    isOptionEqualToValue={(option, value) => option === value}
                  />

                  {categories !== undefined &&
                    professionals !== undefined &&
                    technologies !== undefined &&
                    radialAxisType !== undefined &&
                    radialAxisType !== TechRadarAxisType.company && (
                      <Autocomplete
                        name={formFieldByAxisType[radialAxisType]}
                        label="Bleh"
                        control={control}
                        required
                        multiple
                        options={
                          radialAxisType === TechRadarAxisType.category
                            ? categories
                            : radialAxisType === TechRadarAxisType.professional
                            ? professionals
                            : technologies
                        }
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
