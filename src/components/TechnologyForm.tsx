import { Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { RouterOutput } from '~/utils/trpc';
import TextInput from './form/TextInput';

type Technology = RouterOutput['technology']['byId'];

type TechnologyFormProps = {
  technology: Technology;
  onEdit: (technologyCategory: Technology) => void;
};

const TechnologyForm = ({ technology, onEdit }: TechnologyFormProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: technology.name,
      description: technology.description,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onEdit({
          id: technology.id,
          name: data.name,
          description: data.description,
        });
      })}
    >
      <div className="flex flex-col">
        <div>
          <TextInput
            className="ml-2 my-2"
            name="name"
            label="Name"
            control={control}
            required
          />
        </div>

        <div>
          <TextInput
            className="ml-2 my-2"
            name="description"
            label="Description"
            control={control}
            required
          />
        </div>

        <div>
          <Button className="ml-2" type="submit">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TechnologyForm;
