import { Button, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import { NextPageWithLayout } from '~/pages/_app';
import { OperationKey } from '~/server/routers/professional';
import { RouterInput, trpc } from '~/utils/trpc';

type ProfessionalsSearchQuery = RouterInput['professional']['search'];

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
              control={control}
              required
              options={operators}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Autocomplete
              className="flex-grow basis-1 mr-3"
              name={`techSkills.${index}.level`}
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
          Add Criteria
        </Button>
      </div>

      <div className="flex justify-start pt-5">
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
};

type ProfessionalsProps = {
  query: ProfessionalsSearchQuery;
};

const Professionals = ({ query }: ProfessionalsProps) => {
  const { data: professionals } = trpc.professional.search.useQuery(query);

  return (
    <div className="flex flex-col">
      {professionals?.map((professional) => (
        <div key={professional.id} className="flex flex-row">
          <div className="mx-2">
            <span>{professional.name}</span>
          </div>
          <div className="mx-2">
            <span>{professional.email}</span>
          </div>
        </div>
      ))}
      {professionals?.length === 0 && <span>No professionals found</span>}
    </div>
  );
};

SearchAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default SearchAdminPage;
