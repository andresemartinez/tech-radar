import { TextField } from '@mui/material';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const TextInput = <TFieldValues extends FieldValues = FieldValues>({
  className = '',
  control,
  required = false,
  name,
}: Omit<UseControllerProps<TFieldValues>, 'rules'> & {
  className?: string;
  required?: boolean;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field }) => (
        <TextField className={className} {...field} variant="outlined" />
      )}
    />
  );
};

export default TextInput;
