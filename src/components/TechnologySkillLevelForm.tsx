import { Button } from '@mui/material';
import { inferQueryResponse } from '~/pages/api/trpc/[trpc]';
import { useForm } from 'react-hook-form';
import TextInput from './form/TextInput';
import NumberInput from './form/NumberInput';

type TechnologySkillLevel = inferQueryResponse<'technology-skill-level.byId'>;

type TechnologySkillLevelFormProps = {
  technologySkillLevel: TechnologySkillLevel;
  onEdit: (technologySkillLevel: TechnologySkillLevel) => void;
};

const TechnologySkillLevelForm = ({
  technologySkillLevel,
  onEdit,
}: TechnologySkillLevelFormProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: technologySkillLevel.name,
      weight: technologySkillLevel.weight.toString(),
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onEdit({
          id: technologySkillLevel.id,
          name: data.name,
          weight: Number(data.weight),
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
          <NumberInput
            className="ml-2 my-2"
            name="weight"
            label="Weight"
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

export default TechnologySkillLevelForm;