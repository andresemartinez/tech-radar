import { MenuItem } from '@mui/material';

const SelectOption = ({
  value,
  children,
}: {
  value: string | number | ReadonlyArray<string> | undefined;
  children: JSX.Element | string;
}) => {
  return <MenuItem value={value}>{children}</MenuItem>;
};

export default SelectOption;
