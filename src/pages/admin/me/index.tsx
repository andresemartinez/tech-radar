import { Close as CloseIcon } from '@mui/icons-material';
import { Button, IconButton, MenuItem, Modal, Select } from '@mui/material';
import { Technology, TechSkillLevel } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
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
      {user && <UserInfo name={user.name} email={user.email} />}
      <Divider />
      {professional && (
        <ProfessionalSkills
          professionalId={professional.id}
          skills={professional.techSkills}
          onSkillAdded={() =>
            trpcUtils.invalidateQueries(['professional.byUserId'])
          }
          onSkillDeleted={() =>
            trpcUtils.invalidateQueries(['professional.byUserId'])
          }
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
    level: TechSkillLevel;
    technology: Technology;
  }[];
  onSkillAdded: () => void;
  onSkillDeleted: () => void;
};

const ProfessionalSkills = ({
  professionalId,
  skills,
  onSkillAdded,
  onSkillDeleted,
}: ProfessionalSkillsProps) => {
  const removeSkills = trpc.useMutation('tech-skill.removeTechSkills', {
    async onSuccess() {
      onSkillDeleted();
    },
  });

  return (
    <div className="flex flex-col">
      <span className="font-bold">Skills</span>
      {skills.length <= 0 && <span>No skills registered yet!</span>}
      {skills.map((skill) => (
        <TechSkill
          key={skill.id}
          name={skill.technology.name}
          level={skill.level.name}
          onDelete={() => removeSkills.mutateAsync({ id: skill.id })}
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
  name: string;
  level: string;
  onDelete: () => void;
};

const TechSkill = ({ name, level, onDelete }: TechSkillProps) => {
  return (
    <div className="flex flex-row items-center">
      <span className="pr-2 h-min">{name}</span>
      <span className="pr-4 h-min">{level}</span>
      <IconButton onClick={onDelete} size="small">
        <CloseIcon />
      </IconButton>
    </div>
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

  const { control, handleSubmit } = useForm({
    defaultValues: {
      tech: '',
      level: '',
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
        <div className="absolute top-[50%] left-[50%] w-[400px] px-[20px] py-[40px] bg-white">
          <form
            onSubmit={handleSubmit((data) => {
              onEdit([{ technologyId: data.tech, levelId: data.level }]);
            })}
          >
            <div className="flex flex-row">
              <Controller
                name="tech"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    className="flex-grow mr-3"
                    {...field}
                    variant="outlined"
                  >
                    {technologies?.map((tech) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="level"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    className="flex-grow ml-3"
                    {...field}
                    variant="outlined"
                  >
                    {techSkillLevels?.map((level) => (
                      <MenuItem key={level.id} value={level.id}>
                        {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            <div className="flex justify-end pt-5">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

const Divider = () => {
  return <div className="h-[2px] my-5 bg-gray-600"></div>;
};

ProfessionalAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ProfessionalAdminPage;
