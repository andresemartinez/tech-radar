import { Close as CloseIcon } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import TextInput from '~/components/form/TextInput';
import Modal from '~/components/Modal';
import { NextPageWithLayout } from '~/pages/_app';
import { RouterInput, RouterOutput, trpc } from '~/utils/trpc';

type Category = RouterOutput['techCategory']['all'][number];
type TechCreateMutation = RouterInput['technology']['create']['data'];

const TechnologyAdminPage: NextPageWithLayout = () => {
  const trpcUtils = trpc.useContext();
  const { data: technologies } = trpc.technology.all.useQuery();

  return (
    <div className="flex flex-col ml-6">
      {technologies?.map((technology) => (
        <div key={technology.id} className="flex flex-row">
          <Link
            href={{
              pathname: '/admin/technology/[id]',
              query: { id: technology.id },
            }}
          >
            <div className="py-1">
              <span className="font-bold">{technology.name}</span> (
              {technology.description})
            </div>
          </Link>

          <DeleteTechButton
            id={technology.id}
            name={technology.name}
            onTechDeleted={() => {
              trpcUtils.technology.all.invalidate();
            }}
          />
        </div>
      ))}

      <div className="mt-2">
        <AddTechButton
          onTechAdded={() => {
            trpcUtils.technology.all.invalidate();
          }}
        />
      </div>
    </div>
  );
};

type AddTechButtonProps = {
  onTechAdded: () => void;
};

const AddTechButton = ({ onTechAdded }: AddTechButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: categories } = trpc.techCategory.all.useQuery();

  const addTechnology = trpc.technology.create.useMutation({
    async onSuccess() {
      setModalOpen(false);
      onTechAdded();
    },
  });

  const onAdd = useCallback(
    (technology: TechCreateMutation) => {
      addTechnology.mutateAsync({ data: technology });
    },
    [addTechnology],
  );

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>Add Technology</Button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <AddTechForm
            categories={categories ?? []}
            onCancel={() => setModalOpen(false)}
            onSubmit={(technology) => onAdd(technology)}
          />
        </div>
      </Modal>
    </>
  );
};

type AddTechFormProps = {
  categories: Category[];
  onCancel: () => void;
  onSubmit: (technology: TechCreateMutation) => void;
};

const AddTechForm = ({ categories, onCancel, onSubmit }: AddTechFormProps) => {
  const { t } = useTranslation('button');
  const { control, handleSubmit } = useForm<{
    name: string;
    description: string;
    categories: Category[];
  }>({
    defaultValues: {
      name: '',
      description: '',
      categories: [],
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const { name, description, categories } = data;
        onSubmit({
          name,
          description,
          categories: categories.map((category) => category.id),
        });
      })}
    >
      <div className="flex flex-row pb-2">
        <TextInput
          className="flex-grow basis-1 mr-3"
          name="name"
          label="Name"
          control={control}
          required
        />

        <TextInput
          className="flex-grow basis-1 mr-3"
          name="description"
          label="Description"
          control={control}
          required
        />

        <Autocomplete
          className="flex-grow basis-1 mr-3"
          name="categories"
          label="Categories"
          control={control}
          required
          multiple
          options={categories}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </div>

      <div className="flex justify-end pt-5">
        <Button className="pr-3" onClick={onCancel}>
          {t('cancel')}
        </Button>

        <Button type="submit">{t('save')}</Button>
      </div>
    </form>
  );
};

type DeleteTechButtonProps = {
  id: string;
  name: string;
  onTechDeleted: () => void;
};

const DeleteTechButton = ({
  id,
  name,
  onTechDeleted,
}: DeleteTechButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const removeTech = trpc.technology.delete.useMutation({
    async onSuccess() {
      onTechDeleted();
    },
  });

  return (
    <>
      <IconButton onClick={() => setModalOpen(true)} size="small">
        <CloseIcon />
      </IconButton>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[400px] px-[20px]">
          <div className="flex py-4">
            <span className="text-lg font-bold">{name}</span>
          </div>

          <div className="flex justify-center py-2">
            <span>Are you sure you want to delete this tech?</span>
          </div>

          <div className="flex justify-end pt-4 pb-2">
            <Button className="pr-3" onClick={() => setModalOpen(false)}>
              No
            </Button>
            <Button
              onClick={() => {
                removeTech.mutateAsync({ id });
                setModalOpen(false);
              }}
            >
              Yes
            </Button>
          </div>
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

TechnologyAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default TechnologyAdminPage;
