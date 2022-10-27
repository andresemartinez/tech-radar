import { MenuItem, Select as MuiSelect } from '@mui/material';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const Select = <O, TFieldValues extends FieldValues = FieldValues>({
  className,
  control,
  required = false,
  name,
  options,
  getOptionLabel,
  getOptionValue,
}: Omit<UseControllerProps<TFieldValues>, 'rules'> & {
  className: string;
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
        <MuiSelect className={className} {...field} variant="outlined">
          {options.map((option) => {
            const label = getOptionLabel(option);
            const value = getOptionValue(option);
            return (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            );
          })}
        </MuiSelect>
      )}
    />
  );
};

export default Select;
