import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import Select from '~/components/form/Select';
import SelectOption from '~/components/form/SelectOption';
import Modal from '~/components/Modal';
import ProfessionalTechRadar from '~/components/ProfessionalTechRadar';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const ProfessionalAdminPage: NextPageWithLayout = () => {
  const trpcUtils = trpc.useContext();
  const { data: session } = useSession();
  const { data: professional } = trpc.useQuery([
    'professional.byUserId',
    { userId: session?.user?.id ?? '' },
  ]);

  const user = useMemo(() => session?.user, [session?.user]);

  return (
    <div className="flex flex-col px-5">
      <div className="flex flex-row justify-between">
        {user && <UserInfo name={user.name} email={user.email} />}
        {professional && (
          <ProfessionalTechRadar id={professional.id} size={300} />
        )}
      </div>
      <Divider />
      {professional && (
        <ProfessionalSkills
          professionalId={professional.id}
          skills={professional.techSkills}
          onSkillAdded={() => {
            trpcUtils.invalidateQueries(['professional.byUserId']);
            trpcUtils.invalidateQueries(['chart.tech-radar.byProfessional']);
          }}
          onSkillEdited={() => {
            trpcUtils.invalidateQueries(['professional.byUserId']);
            trpcUtils.invalidateQueries(['chart.tech-radar.byProfessional']);
          }}
          onSkillDeleted={() => {
            trpcUtils.invalidateQueries(['professional.byUserId']);
            trpcUtils.invalidateQueries(['chart.tech-radar.byProfessional']);
          }}
        />
      )}
    </div>
  );
};

type UserInfoProps = {
  name?: string | null;
  email?: string | null;
};

const UserInfo = ({ name, email }: UserInfoProps) => {
  return (
    <div className="flex flex-col">
      <div className="pb-3">
        <span className="font-bold">Name: </span>
        <span>{name}</span>
      </div>
      <div>
        <span className="font-bold">E-mail: </span>
        <span>{email}</span>
      </div>
    </div>
  );
};

type ProfessionalSkillsProps = {
  professionalId: string;
  skills: {
    id: string;
    level: {
      id: string;
      name: string;
    };
    technology: {
      id: string;
      name: string;
    };
  }[];
  onSkillAdded: () => void;
  onSkillDeleted: () => void;
  onSkillEdited: () => void;
};

const ProfessionalSkills = ({
  professionalId,
  skills,
  onSkillAdded,
  onSkillDeleted,
  onSkillEdited,
}: ProfessionalSkillsProps) => {
  return (
    <div className="flex flex-col">
      <span className="font-bold">Skills</span>
      {skills.length <= 0 && <span>No skills registered yet!</span>}
      {skills.map((skill) => (
        <TechSkill
          key={skill.id}
          skill={skill}
          onSkillDeleted={onSkillDeleted}
          onSkillEdited={onSkillEdited}
        />
      ))}
      <div className="mt-3">
        <AddSkillButton
          professionalId={professionalId}
          onSkillAdded={onSkillAdded}
        />
      </div>
    </div>
  );
};

type TechSkillProps = {
  skill: {
    id: string;
    level: {
      id: string;
      name: string;
    };
    technology: {
      id: string;
      name: string;
    };
  };
  onSkillDeleted: () => void;
  onSkillEdited: () => void;
};

const TechSkill = ({
  skill,
  onSkillDeleted,
  onSkillEdited,
}: TechSkillProps) => {
  return (
    <div className="flex flex-row items-center">
      <span className="pr-2 h-min">{skill.technology.name}</span>
      <span className="pr-4 h-min">{skill.level.name}</span>
      <EditSkillButton skill={skill} onSkillEdited={onSkillEdited} />
      <DeleteSkillButton
        id={skill.id}
        technology={skill.technology.name}
        level={skill.level.name}
        onSkillDeleted={onSkillDeleted}
      />
    </div>
  );
};

type DeleteSkillButtonProps = {
  id: string;
  technology: string;
  level: string;
  onSkillDeleted: () => void;
};

const DeleteSkillButton = ({
  id,
  technology,
  level,
  onSkillDeleted,
}: DeleteSkillButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const removeSkills = trpc.useMutation('tech-skill.delete', {
    async onSuccess() {
      onSkillDeleted();
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
            <span className="text-lg font-bold">
              {technology} - {level}
            </span>
          </div>

          <div className="flex justify-center py-2">
            <span>Are you sure you want to delete this skill?</span>
          </div>

          <div className="flex justify-end pt-4 pb-2">
            <Button className="pr-3" onClick={() => setModalOpen(false)}>
              No
            </Button>
            <Button
              onClick={() => {
                removeSkills.mutateAsync({ id });
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

type EditSkillButtonProps = {
  skill: {
    id: string;
    level: {
      id: string;
      name: string;
    };
    technology: {
      id: string;
      name: string;
    };
  };
  onSkillEdited: () => void;
};

const EditSkillButton = ({ skill, onSkillEdited }: EditSkillButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: techSkillLevels } = trpc.useQuery([
    'technology-skill-level.all',
  ]);

  const editSkills = trpc.useMutation('tech-skill.edit', {
    async onSuccess() {
      setModalOpen(false);
      onSkillEdited();
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      level: skill.level.id,
    },
  });

  const onEdit = useCallback(
    ({ levelId }: { levelId: string }) => {
      editSkills.mutateAsync({ id: skill.id, data: { levelId } });
    },
    [editSkills, skill.id],
  );

  return (
    <>
      <IconButton onClick={() => setModalOpen(true)}>
        <EditIcon />
      </IconButton>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[400px] px-[20px] py-[40px]">
          <form
            onSubmit={handleSubmit((data) => {
              onEdit({ levelId: data.level });
            })}
          >
            <div className="flex flex-row">
              <span className="mr-3">{skill.technology.name}</span>

              <Select
                name="level"
                className="flex-grow ml-3"
                control={control}
                required
              >
                {techSkillLevels?.map((level) => (
                  <SelectOption key={level.id} value={level.id}>
                    {level.name}
                  </SelectOption>
                ))}
              </Select>
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

type AddSkillButtonProps = {
  professionalId: string;
  onSkillAdded: () => void;
};

const AddSkillButton = ({
  professionalId,
  onSkillAdded,
}: AddSkillButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: technologies } = trpc.useQuery(['technology.all']);
  const { data: techSkillLevels } = trpc.useQuery([
    'technology-skill-level.all',
  ]);

  const addSkills = trpc.useMutation('professional.addTechSkills', {
    async onSuccess() {
      setModalOpen(false);
      onSkillAdded();
    },
  });

  const onEdit = useCallback(
    (skills: { levelId: string; technologyId: string }[]) => {
      addSkills.mutateAsync({ id: professionalId, skills });
    },
    [addSkills, professionalId],
  );

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>Add Skill</Button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <AddSkillForm
            technologies={technologies ?? []}
            levels={techSkillLevels ?? []}
            onCancel={() => setModalOpen(false)}
            onSubmit={(techSkills) => onEdit(techSkills)}
          />
        </div>
      </Modal>
    </>
  );
};

type AddSkillFormProps = {
  technologies: { id: string; name: string }[];
  levels: { id: string; name: string }[];
  onCancel: () => void;
  onSubmit: (techSkills: { technologyId: string; levelId: string }[]) => void;
};

const AddSkillForm = ({
  technologies,
  levels,
  onCancel,
  onSubmit,
}: AddSkillFormProps) => {
  const { control, handleSubmit } = useForm<{
    techSkills: {
      tech: { id: string; name: string } | null;
      level: string;
    }[];
  }>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techSkills',
  });

  const selectedSkills = useWatch({
    control,
    name: 'techSkills',
    defaultValue: [],
  });

  useEffect(() => {
    if (fields && fields.length <= 0 && append) {
      append({ tech: null, level: '' });
    }
  }, [append, fields]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(
          data.techSkills.map((techSkill) => ({
            technologyId: techSkill.tech?.id ?? '',
            levelId: techSkill.level,
          })),
        );
      })}
    >
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-row pb-2">
          <Autocomplete
            className="flex-grow basis-1 mr-3"
            name={`techSkills.${index}.tech`}
            control={control}
            required
            options={technologies}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options) =>
              options.filter((option) =>
                selectedSkills.every(
                  (selectedSkill) => option.id !== selectedSkill.tech?.id,
                ),
              )
            }
          />

          <Select
            name={`techSkills.${index}.level`}
            className="flex-grow ml-3"
            control={control}
            required
          >
            {levels?.map((level) => (
              <SelectOption key={level.id} value={level.id}>
                {level.name}
              </SelectOption>
            ))}
          </Select>

          <IconButton
            className="ml-2"
            disabled={(fields?.length ?? 0) <= 1}
            onClick={() => remove(index)}
          >
            <CloseIcon />
          </IconButton>
        </div>
      ))}

      <div className="flex flex-row pt-2">
        <Button
          disabled={!selectedSkills.every((skill) => skill.tech && skill.level)}
          onClick={() => append({ tech: null, level: '' })}
        >
          Add Row
        </Button>
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

const Divider = () => {
  return <div className="h-[2px] my-5 bg-gray-600"></div>;
};

ProfessionalAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ProfessionalAdminPage;
