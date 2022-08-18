import {
  Autocomplete as MuiAutocomplete,
  AutocompleteFreeSoloValueMapping,
  FilterOptionsState,
  TextField,
} from '@mui/material';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const Autocomplete = <
  TFieldValues extends FieldValues = FieldValues,
  T = any,
  FreeSolo extends boolean | undefined = undefined,
>({
  className,
  control,
  rules,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  filterOptions,
  name,
}: UseControllerProps<TFieldValues> & {
  className: string;
  options: ReadonlyArray<T>;
  filterOptions?: (options: T[], state: FilterOptionsState<T>) => T[];
  getOptionLabel?: (
    option: T | AutocompleteFreeSoloValueMapping<FreeSolo>,
  ) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <MuiAutocomplete
          className={className}
          selectOnFocus
          clearOnEscape
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          filterOptions={filterOptions}
          onChange={(_, value) => field.onChange(value)}
          onBlur={() => field.onBlur()}
          renderInput={(params) => (
            <TextField {...params} inputRef={field.ref} variant="outlined" />
          )}
        />
      )}
    />
  );
};

export default Autocomplete;
