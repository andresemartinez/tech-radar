import { Button, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import TextInput from '~/components/form/TextInput';
import Modal from '~/components/Modal';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const TechnologyCategoriesAdminPage: NextPageWithLayout = () => {
  const trpcUtils = trpc.useContext();
  const { data: technologyCategories } = trpc.technologyCategory.all.useQuery();

  return (
    <div className="flex flex-col ml-6">
      {technologyCategories?.map((technologyCategory) => (
        <div key={technologyCategory.id} className="flex flex-row">
          <Link
            href={{
              pathname: '/admin/technology/category/[id]',
              query: { id: technologyCategory.id },
            }}
          >
            <a>{technologyCategory.name}</a>
          </Link>

          <DeleteCategoryButton
            id={technologyCategory.id}
            name={technologyCategory.name}
            onCategoryDeleted={() => {
              trpcUtils.technologyCategory.all.invalidate();
            }}
          />
        </div>
      ))}

      <div className="mt-2">
        <AddCategoryButton
          onCategoryAdded={() => {
            trpcUtils.technologyCategory.all.invalidate();
          }}
        />
      </div>
    </div>
  );
};

type AddCategoryButtonProps = {
  onCategoryAdded: () => void;
};

const AddCategoryButton = ({ onCategoryAdded }: AddCategoryButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const addCategory = trpc.technologyCategory.create.useMutation({
    async onSuccess() {
      setModalOpen(false);
      onCategoryAdded();
    },
  });

  const onAdd = useCallback(
    (category: { name: string }) => {
      addCategory.mutateAsync({ data: category });
    },
    [addCategory],
  );

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>Add Category</Button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <AddCategoryForm
            onCancel={() => setModalOpen(false)}
            onSubmit={(category) => onAdd(category)}
          />
        </div>
      </Modal>
    </>
  );
};

type AddCategoryFormProps = {
  onCancel: () => void;
  onSubmit: (category: { name: string }) => void;
};

const AddCategoryForm = ({ onCancel, onSubmit }: AddCategoryFormProps) => {
  const { control, handleSubmit } = useForm<{
    name: string;
  }>();

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))}>
      <div className="flex flex-row pb-2">
        <TextInput
          className="flex-grow basis-1 mr-3"
          name="name"
          label="Name"
          control={control}
          required
        />
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

type DeleteCategoryButtonProps = {
  id: string;
  name: string;
  onCategoryDeleted: () => void;
};

const DeleteCategoryButton = ({
  id,
  name,
  onCategoryDeleted,
}: DeleteCategoryButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const removeTech = trpc.technologyCategory.delete.useMutation({
    async onSuccess() {
      onCategoryDeleted();
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
            <span>Are you sure you want to delete this category?</span>
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

TechnologyCategoriesAdminPage.getLayout = (page) => (
  <AdminLayout>{page}</AdminLayout>
);

export default TechnologyCategoriesAdminPage;
