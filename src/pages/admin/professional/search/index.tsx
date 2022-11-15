import { Button, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import { NextPageWithLayout } from '~/pages/_app';
import { OperationKey } from '~/server/routers/professional';
import { RouterInput, RouterOutput, trpc } from '~/utils/trpc';
import Modal from '~/components/Modal';
import ProfessionalTechRadar from '~/components/ProfessionalTechRadar';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

type ProfessionalsSearchQuery = RouterInput['professional']['search'];
type ProfessionalsSearchResult = RouterOutput['professional']['search'];
type Professional = ProfessionalsSearchResult[number];

const SearchAdminPage: NextPageWithLayout = () => {
  const [professionalsQuery, setProfessionalsQuery] =
    useState<ProfessionalsSearchQuery>();

  const { data: technologies } = trpc.technology.all.useQuery();
  const { data: levels } = trpc.techSkillLevel.all.useQuery();

  const operators = useMemo<{ id: OperationKey; name: string }[]>(
    () => [
      { id: 'gte', name: '>=' },
      { id: 'lte', name: '<=' },
      { id: 'eq', name: '=' },
    ],
    [],
  );

  return (
    <div>
      {technologies && levels && (
        <SearchForm
          technologies={technologies}
          levels={levels}
          operators={operators}
          onSearch={(query) => setProfessionalsQuery(query)}
        />
      )}
      {professionalsQuery && <Professionals query={professionalsQuery} />}
    </div>
  );
};

type SearchFormProps = {
  technologies: { id: string; name: string; [key: string]: any }[];
  levels: { id: string; name: string; weight: number; [key: string]: any }[];
  operators: { id: OperationKey; name: string }[];
  onSearch: (query: ProfessionalsSearchQuery) => void;
};

const SearchForm = ({
  technologies,
  levels,
  operators,
  onSearch,
}: SearchFormProps) => {
  const { t: tc } = useTranslation();
  const { t: tb } = useTranslation('button');
  const { control, handleSubmit } = useForm<{
    techSkills: {
      tech: { id: string; name: string } | null;
      level: { id: string; name: string; weight: number } | null;
      operator: { id: OperationKey; name: string } | null;
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
      append({ tech: null, level: null, operator: null });
    }
  }, [append, fields]);

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSearch({
          techSkills: data.techSkills.map((techSkill) => ({
            techId: techSkill.tech?.id ?? '',
            levelWeight: Number(techSkill.level?.weight) ?? 0,
            levelOperator: techSkill.operator?.id ?? 'eq',
          })),
        }),
      )}
    >
      <div className="flex flex-col pb-2">
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

            <Autocomplete
              className="flex-grow basis-1 mr-3"
              name={`techSkills.${index}.operator`}
              label={tc('operator')}
              control={control}
              required
              options={operators}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Autocomplete
              className="flex-grow basis-1 mr-3"
              name={`techSkills.${index}.level`}
              label={tc('techSkillLevel_short')}
              control={control}
              required
              options={levels}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
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
      </div>

      <div className="flex flex-row pt-2">
        <Button
          disabled={!selectedSkills.every((skill) => skill.tech && skill.level)}
          onClick={() => append({ tech: null, level: null, operator: null })}
        >
          {tb('addCriteria')}
        </Button>
      </div>

      <div className="flex justify-start pt-5">
        <Button type="submit">{tb('search')}</Button>
      </div>
    </form>
  );
};

type ProfessionalsProps = {
  query: ProfessionalsSearchQuery;
};

const Professionals = ({ query }: ProfessionalsProps) => {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    Professional['id'] | null
  >(null);

  const { data: professionals } = trpc.professional.search.useQuery(query);
  const { data: professional } = trpc.professional.byId.useQuery(
    {
      id: selectedProfessionalId ?? '',
    },
    { enabled: !!selectedProfessionalId },
  );

  const selectedProfessional = useMemo(
    () =>
      professionals?.find(
        (professional) => professional.id === selectedProfessionalId,
      ),
    [professionals, selectedProfessionalId],
  );

  return (
    <>
      <div className="flex flex-col">
        {professionals?.map((professional) => (
          <ProfessionalRow
            key={professional.id}
            professional={professional}
            onClick={(professionalId) =>
              setSelectedProfessionalId(professionalId)
            }
          />
        ))}
        {professionals?.length === 0 && <span>No professionals found</span>}
      </div>

      <Modal
        open={!!selectedProfessionalId}
        onClose={() => setSelectedProfessionalId(null)}
      >
        <div className="w-[800px] px-[20px] py-[40px]">
          <div className="flex flex-row pb-[20px] align-bottom">
            <span className="font-bold text-lg pr-1">
              {selectedProfessional?.name}
            </span>
            <span className="font-semibold text-sm text-gray-500 leading-7 pl-1">
              ({selectedProfessional?.email})
            </span>
          </div>

          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              {professional?.techSkills.map((techSkill) => (
                <div key={techSkill.id} className="flex flex-row pb-2">
                  <span className="pr-1">{techSkill.technology.name}</span>
                  <span className="pl-1">{techSkill.level.name}</span>
                </div>
              ))}
            </div>
            <div>
              <ProfessionalTechRadar
                id={selectedProfessional?.id ?? ''}
                size={200}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

type ProfessionalRowProps = {
  professional: Professional;
  onClick: (id: Professional['id']) => void;
};

const ProfessionalRow = ({ professional, onClick }: ProfessionalRowProps) => {
  return (
    <div className="flex flex-row" onClick={() => onClick(professional.id)}>
      <div className="mx-2">
        <span>{professional.name}</span>
      </div>
      <div className="mx-2">
        <span>{professional.email}</span>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const serverSideTranslation = locale
    ? await serverSideTranslations(locale, [
        ...AdminLayout.namespacesRequired,
        'common',
        'button',
      ])
    : {};

  return {
    props: {
      ...serverSideTranslation,
    },
  };
};

SearchAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default SearchAdminPage;
