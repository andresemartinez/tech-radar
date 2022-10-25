import { TextField } from '@mui/material';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const TextInput = <TFieldValues extends FieldValues = FieldValues>({
  className = '',
  control,
  required = false,
  name,
  label,
}: Omit<UseControllerProps<TFieldValues>, 'rules'> & {
  className?: string;
  required?: boolean;
  label?: React.ReactNode;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field }) => (
        <TextField
          className={className}
          {...field}
          variant="outlined"
          label={label}
        />
      )}
    />
  );
};

export default TextInput;
