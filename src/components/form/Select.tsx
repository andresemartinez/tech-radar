import { MenuItem, Select as MuiSelect, TextField } from '@mui/material';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const Select = <O, TFieldValues extends FieldValues = FieldValues>({
  className,
  control,
  required = false,
  name,
  label,
  options,
  getOptionLabel,
  getOptionValue,
}: Omit<UseControllerProps<TFieldValues>, 'rules'> & {
  className: string;
  label?: string;
  required: boolean;
  options: O[];
  getOptionLabel: (option: O) => string | JSX.Element | JSX.Element[];
  getOptionValue: (option: O) => string | number;
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
          select
        >
          {options.map((option) => {
            const label = getOptionLabel(option);
            const value = getOptionValue(option);
            return (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            );
          })}
        </TextField>
      )}
    />
  );
};

export default Select;
