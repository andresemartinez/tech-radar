import { TextField } from '@mui/material';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const allowedNonNumericKeys = [
  'Backspace',
  'Home',
  'Back',
  'End',
  'Tab',
  'Enter',
];
const numbersRegexp = /[0-9]/;

const isNumber = (str: string) => numbersRegexp.test(str);

const NumberInput = <TFieldValues extends FieldValues = FieldValues>({
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
          InputProps={{
            onKeyDown: (event) => {
              const key = event.key;
              if (!(allowedNonNumericKeys.includes(key) || isNumber(key))) {
                event.preventDefault();
                event.stopPropagation();
              }
            },
          }}
        />
      )}
    />
  );
};

export default NumberInput;
