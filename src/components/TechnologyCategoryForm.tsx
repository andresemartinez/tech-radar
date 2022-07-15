import { Button, TextField } from '@mui/material';
import { inferQueryResponse } from '~/pages/api/trpc/[trpc]';
import { Controller, useForm } from 'react-hook-form';

type TechnologyCategory = inferQueryResponse<'technology-category.byId'>;

type TechnologyCategoryFormProps = {
  technologyCategory: TechnologyCategory;
  onEdit: (technologyCategory: TechnologyCategory) => void;
};

const TechnologyCategoryForm = ({
  technologyCategory,
  onEdit,
}: TechnologyCategoryFormProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: technologyCategory.name,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onEdit({
          id: technologyCategory.id,
          name: data.name,
        });
      })}
    >
      <Controller
        name="name"
        control={control}
        rules={{ required: true }}
        render={({ field }) => <TextField {...field} variant="outlined" />}
      />

      <Button type="submit">Save</Button>
    </form>
  );
};

export default TechnologyCategoryForm;
