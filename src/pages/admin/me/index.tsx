import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import Select from '~/components/form/Select';
import TextInput from '~/components/form/TextInput';
import Modal from '~/components/Modal';
import ProfessionalTechRadar from '~/components/ProfessionalTechRadar';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

const ProfessionalAdminPage: NextPageWithLayout = () => {
  const trpcUtils = trpc.useContext();
  const { data: session } = useSession();
  const { data: professional } = trpc.professional.byUserId.useQuery({
    userId: session?.user?.id ?? '',
  });

  const user = useMemo(() => session?.user, [session?.user]);

  return (
    <div className="flex flex-col px-5">
      <div className="flex flex-row justify-between">
        {user && <UserInfo id={user.id} name={user.name} email={user.email} />}
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
            trpcUtils.professional.byUserId.invalidate();
            trpcUtils.chart.techRadar.byProfessional.invalidate();
          }}
          onSkillEdited={() => {
            trpcUtils.professional.byUserId.invalidate();
            trpcUtils.chart.techRadar.byProfessional.invalidate();
          }}
          onSkillDeleted={() => {
            trpcUtils.professional.byUserId.invalidate();
            trpcUtils.chart.techRadar.byProfessional.invalidate();
          }}
        />
      )}
    </div>
  );
};

type UserInfoProps = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
};

const UserInfo = ({ id, name, email }: UserInfoProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <div className="pb-3">
        <span className="font-bold">{t('name')}: </span>
        <span>{name}</span>
        {id && name && <EditUserInfoButton id={id} name={name} />}
      </div>
      <div>
        <span className="font-bold">{t('email')}: </span>
        <span>{email}</span>
      </div>
    </div>
  );
};

type EditUserInfoButtonProps = {
  id: string;
  name: string;
};

const EditUserInfoButton = ({ id, name }: EditUserInfoButtonProps) => {
  const { t } = useTranslation('button');
  const [modalOpen, setModalOpen] = useState(false);

  const editUserInfo = trpc.user.edit.useMutation({
    async onSuccess() {
      setModalOpen(false);

      // This is the only way I found to refresh the user in the session context
      const event = new Event('visibilitychange');
      document.dispatchEvent(event);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name,
    },
  });

  return (
    <>
      <IconButton onClick={() => setModalOpen(true)}>
        <EditIcon />
      </IconButton>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[400px] px-[20px] py-[40px]">
          <form
            onSubmit={handleSubmit((data) => {
              editUserInfo.mutateAsync({ id, data: { name: data.name } });
            })}
          >
            <div className="flex flex-row">
              <TextInput name="name" control={control} required />
            </div>

            <div className="flex justify-end pt-5">
              <Button className="pr-3" onClick={() => setModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">{t('save')}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <span className="font-bold">{t('skill')}</span>
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
  const { t: tb } = useTranslation('button');
  const { t: td } = useTranslation('dialog');
  const [modalOpen, setModalOpen] = useState(false);
  const removeSkills = trpc.techSkill.delete.useMutation({
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
            <span>{td('deleteTechSkillConfirmation')}</span>
          </div>

          <div className="flex justify-end pt-4 pb-2">
            <Button className="pr-3" onClick={() => setModalOpen(false)}>
              {tb('no')}
            </Button>
            <Button
              onClick={() => {
                removeSkills.mutateAsync({ id });
                setModalOpen(false);
              }}
            >
              {tb('yes')}
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
  const { data: techSkillLevels } = trpc.techSkillLevel.all.useQuery();
  const { t: tc } = useTranslation();
  const { t: tb } = useTranslation('button');

  const editSkills = trpc.techSkill.edit.useMutation({
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
                className="flex-grow ml-3"
                name="level"
                label={tc('techSkillLevel_short')}
                control={control}
                required
                options={techSkillLevels ?? []}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
              />
            </div>

            <div className="flex justify-end pt-5">
              <Button className="pr-3" onClick={() => setModalOpen(false)}>
                {tb('cancel')}
              </Button>
              <Button type="submit">{tb('save')}</Button>
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
  const { t: tb } = useTranslation('button');
  const [modalOpen, setModalOpen] = useState(false);
  const { data: technologies } = trpc.technology.all.useQuery();
  const { data: techSkillLevels } = trpc.techSkillLevel.all.useQuery();

  const addSkills = trpc.professional.addTechSkills.useMutation({
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
      <Button onClick={() => setModalOpen(true)}>{tb('addSkill')}</Button>
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
  const { t: tc } = useTranslation();
  const { t: tb } = useTranslation('button');
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
            label={tc('technology')}
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
            label={tc('techSkillLevel_short')}
            control={control}
            required
            options={levels}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
          />

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
          {tb('addRow')}
        </Button>
      </div>

      <div className="flex justify-end pt-5">
        <Button className="pr-3" onClick={onCancel}>
          {tb('cancel')}
        </Button>

        <Button type="submit">{tb('save')}</Button>
      </div>
    </form>
  );
};

const Divider = () => {
  return <div className="h-[2px] my-5 bg-gray-600"></div>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const serverSideTranslation = locale
    ? await serverSideTranslations(locale, [
        ...AdminLayout.namespacesRequired,
        'common',
        'dialog',
        'button',
      ])
    : {};

  return {
    props: {
      ...serverSideTranslation,
    },
  };
};

ProfessionalAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ProfessionalAdminPage;
