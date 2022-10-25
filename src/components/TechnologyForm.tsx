import { Button, TextField } from '@mui/material';
import { inferQueryResponse } from '~/pages/api/trpc/[trpc]';
import { Controller, useForm } from 'react-hook-form';

type Technology = inferQueryResponse<'technology.byId'>;

type TechnologyFormProps = {
  technology: Technology;
  onEdit: (technologyCategory: Technology) => void;
};

const TechnologyForm = ({ technology, onEdit }: TechnologyFormProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: technology.name,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onEdit({
          id: technology.id,
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

export default TechnologyForm;
