import { Button } from '@mui/material';
import { inferQueryResponse } from '~/pages/api/trpc/[trpc]';
import { useForm } from 'react-hook-form';
import TextInput from '../components/form/TextInput';

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
          <Button className="ml-2" type="submit">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TechnologyCategoryForm;
