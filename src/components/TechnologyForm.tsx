import { Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { RouterOutput } from '~/utils/trpc';
import Autocomplete from './form/Autocomplete';
import TextInput from './form/TextInput';

type Technology = RouterOutput['technology']['byId'];
type Category = RouterOutput['techCategory']['all'][number];

type TechnologyFormProps = {
  technology: Technology;
  categories: Category[];
  onEdit: (technology: {
    id: string;
    name: string;
    description: string;
    categories: string[];
  }) => void;
};

const TechnologyForm = ({
  technology,
  categories,
  onEdit,
}: TechnologyFormProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: technology.name,
      description: technology.description,
      categories: technology.categories,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const { name, description, categories } = data;
        onEdit({
          id: technology.id,
          name,
          description,
          categories: categories.map((category) => category.id),
        });
      })}
    >
      <div className="flex flex-col">
        <div className="flex flex-row w-[500px]">
          <TextInput
            className="flex-grow ml-2 my-2"
            name="name"
            label="Name"
            control={control}
            required
          />
        </div>

        <div className="flex flex-row w-[500px]">
          <TextInput
            className="flex-grow  ml-2 my-2"
            name="description"
            label="Description"
            control={control}
            required
          />
        </div>

        <div className="flex flex-row w-[500px]">
          <Autocomplete
            className="flex-grow ml-2 my-2"
            name="categories"
            label="Categories"
            control={control}
            required
            multiple
            options={categories}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
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
