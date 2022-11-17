import {
  Autocomplete as MuiAutocomplete,
  AutocompleteFreeSoloValueMapping,
  FilterOptionsState,
  TextField,
} from '@mui/material';
import { useMemo } from 'react';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const Autocomplete = <
  TFieldValues extends FieldValues = FieldValues,
  T = any,
  FreeSolo extends boolean | undefined = undefined,
>({
  className,
  control,
  required = false,
  disabled = false,
  min,
  max,
  minLength,
  maxLength,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  filterOptions,
  name,
  label,
  multiple = false,
}: Omit<UseControllerProps<TFieldValues>, 'rules'> & {
  className?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  minLength?: number;
  maxLength?: number;
  label?: string;
  multiple?: boolean;
  options: ReadonlyArray<T>;
  filterOptions?: (options: T[], state: FilterOptionsState<T>) => T[];
  getOptionLabel?: (
    option: T | AutocompleteFreeSoloValueMapping<FreeSolo>,
  ) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
}) => {
  const validate = useMemo(() => {
    const validation: { [key: string]: (v: T) => boolean } = {};

    if (multiple) {
      if (required) {
        validation.required = (value) =>
          Array.isArray(value) && value.length >= 1;
      }

      if (minLength) {
        validation.minLength = (value) =>
          Array.isArray(value) && value.length >= minLength;
      }

      if (maxLength) {
        validation.maxLength = (value) =>
          Array.isArray(value) && value.length <= maxLength;
      }
    }

    return validation;
  }, [multiple, required, minLength, maxLength]);

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required,
        min,
        max,
        minLength,
        maxLength,
        validate,
      }}
      render={({ field, fieldState: { error } }) => (
        <MuiAutocomplete
          className={className}
          selectOnFocus
          clearOnEscape
          disabled={disabled}
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          filterOptions={filterOptions}
          multiple={multiple}
          onChange={(_, value) => field.onChange(value)}
          onBlur={() => field.onBlur()}
          value={field.value ?? (multiple ? [] : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              name={field.name}
              inputRef={field.ref}
              variant="outlined"
              label={label}
              error={error !== undefined}
            />
          )}
        />
      )}
    />
  );
};

export default Autocomplete;
