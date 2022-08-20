import { Select as MuiSelect } from '@mui/material';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const Select = <TFieldValues extends FieldValues = FieldValues>({
  className,
  control,
  required = false,
  name,
  children,
}: Omit<UseControllerProps<TFieldValues>, 'rules'> & {
  className: string;
  required: boolean;
  children: JSX.Element | JSX.Element[] | undefined;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field }) => (
        <MuiSelect className={className} {...field} variant="outlined">
          {children}
        </MuiSelect>
      )}
    />
  );
};

export default Select;
