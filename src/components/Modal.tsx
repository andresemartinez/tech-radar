import { Modal as MuiModal } from '@mui/material';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: JSX.Element;
};

const Modal = ({ open, onClose, children }: ModalProps) => {
  return (
    <MuiModal open={open} onClose={onClose}>
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white">
        {children}
      </div>
    </MuiModal>
  );
};

export default Modal;
