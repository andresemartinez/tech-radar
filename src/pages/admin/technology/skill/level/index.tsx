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
import NumberInput from '~/components/form/NumberInput';

const TechnologySkillsLevelAdminPage: NextPageWithLayout = () => {
  const trpcUtils = trpc.useContext();
  const { data: technologySkillsLevel } = trpc.useQuery([
    'technology-skill-level.all',
  ]);

  return (
    <div className="flex flex-col ml-6">
      {technologySkillsLevel?.map((technologySkillLevel) => (
        <div key={technologySkillLevel.id} className="flex flex-row">
          <Link
            href={{
              pathname: '/admin/technology/skill/level/[id]',
              query: { id: technologySkillLevel.id },
            }}
          >
            <a>
              <span className="font-bold">{technologySkillLevel.name}</span> (
              {technologySkillLevel.weight})
            </a>
          </Link>

          <DeleteSkillLevelButton
            id={technologySkillLevel.id}
            name={technologySkillLevel.name}
            onSkillLevelDeleted={() => {
              trpcUtils.invalidateQueries(['technology-skill-level.all']);
            }}
          />
        </div>
      ))}

      <div className="mt-2">
        <AddSkillLevelButton
          onSkillLevelAdded={() => {
            trpcUtils.invalidateQueries(['technology-skill-level.all']);
          }}
        />
      </div>
    </div>
  );
};

type AddSkillLevelButtonProps = {
  onSkillLevelAdded: () => void;
};

const AddSkillLevelButton = ({
  onSkillLevelAdded,
}: AddSkillLevelButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const addSkillLevel = trpc.useMutation('technology-skill-level.create', {
    async onSuccess() {
      setModalOpen(false);
      onSkillLevelAdded();
    },
  });

  const onAdd = useCallback(
    (skillLevel: { name: string; weight: number }) => {
      addSkillLevel.mutateAsync({ data: skillLevel });
    },
    [addSkillLevel],
  );

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>Add Skill Level</Button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <AddSkillLevelForm
            onCancel={() => setModalOpen(false)}
            onSubmit={(skillLevel) => onAdd(skillLevel)}
          />
        </div>
      </Modal>
    </>
  );
};

type AddSkillLevelFormProps = {
  onCancel: () => void;
  onSubmit: (skillLevel: { name: string; weight: number }) => void;
};

const AddSkillLevelForm = ({ onCancel, onSubmit }: AddSkillLevelFormProps) => {
  const { control, handleSubmit } = useForm<{
    name: string;
    weight: string;
  }>();

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({ name: data.name, weight: Number(data.weight) }),
      )}
    >
      <div className="flex flex-row pb-2">
        <TextInput
          className="flex-grow basis-1 mr-3"
          name="name"
          label="Name"
          control={control}
          required
        />

        <NumberInput
          className="flex-grow basis-1 mr-3"
          name="weight"
          label="Weight"
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

type DeleteSkillLevelButtonProps = {
  id: string;
  name: string;
  onSkillLevelDeleted: () => void;
};

const DeleteSkillLevelButton = ({
  id,
  name,
  onSkillLevelDeleted,
}: DeleteSkillLevelButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const removeTech = trpc.useMutation('technology-skill-level.delete', {
    async onSuccess() {
      onSkillLevelDeleted();
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
            <span>Are you sure you want to delete this skill level?</span>
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

TechnologySkillsLevelAdminPage.getLayout = (page) => (
  <AdminLayout>{page}</AdminLayout>
);

export default TechnologySkillsLevelAdminPage;
