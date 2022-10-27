import { Close as CloseIcon } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import TextInput from '~/components/form/TextInput';
import Modal from '~/components/Modal';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

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
            <a className="py-1">
              <span className="font-bold">{technology.name}</span> (
              {technology.description})
            </a>
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

  const addTechnology = trpc.technology.create.useMutation({
    async onSuccess() {
      setModalOpen(false);
      onTechAdded();
    },
  });

  const onAdd = useCallback(
    (technology: { name: string; description: string }) => {
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
            onCancel={() => setModalOpen(false)}
            onSubmit={(technology) => onAdd(technology)}
          />
        </div>
      </Modal>
    </>
  );
};

type AddTechFormProps = {
  onCancel: () => void;
  onSubmit: (technology: { name: string; description: string }) => void;
};

const AddTechForm = ({ onCancel, onSubmit }: AddTechFormProps) => {
  const { control, handleSubmit } = useForm<{
    name: string;
    description: string;
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

        <TextInput
          className="flex-grow basis-1 mr-3"
          name="description"
          label="Description"
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

TechnologyAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default TechnologyAdminPage;
