import { Backdrop, Popper } from '@mui/material';
import { useRef, useState } from 'react';
import { BlockPicker } from 'react-color';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

const ColorPicker = <TFieldValues extends FieldValues = FieldValues>({
  control,
  required = false,
  name,
  colors,
}: Omit<UseControllerProps<TFieldValues>, 'rules'> & {
  className?: string;
  required?: boolean;
  colors?: string[];
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required,
      }}
      render={({ field }) => (
        <>
          <div
            ref={buttonRef}
            role="button"
            className="w-[22px] h-[22px] m-[10px] rounded-full border border-gray-600"
            style={{ backgroundColor: field.value }}
            onClick={() => setPickerOpen(true)}
          ></div>

          <Backdrop
            open={pickerOpen}
            onClick={() => {
              console.log('backdrop clicked');
              setPickerOpen(false);
            }}
            sx={{ backgroundColor: 'transparent' }}
          >
            <Popper
              open={pickerOpen}
              anchorEl={buttonRef.current}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <div className="pt-[11px]">
                <BlockPicker
                  ref={field.ref}
                  color={field.value}
                  colors={colors}
                  onChangeComplete={({ hex: color }) => {
                    field.onChange(color);
                    setPickerOpen(false);
                  }}
                />
              </div>
            </Popper>
          </Backdrop>
        </>
      )}
    />
  );
};

export default ColorPicker;
