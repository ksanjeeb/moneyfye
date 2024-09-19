import { Modal } from 'antd';
import TransactionMenu, { TransactionModalMenu } from './transaction-menu';
import { nanoid } from '@reduxjs/toolkit';

interface ModalState {
    value: boolean;
    data: any;
}

interface FormModalProps {
    isModalOpen: ModalState;
    isNew?: boolean;
    setIsModalOpen: (state: ModalState) => void;
}

const FormModal = ({ isModalOpen, isNew = false, setIsModalOpen }:FormModalProps) => {
    const handleCancel = () => {
        setIsModalOpen({ value: false, data: {} });
    };

    return (
        <Modal
            title="Transaction"
            open={isModalOpen.value}
            onCancel={handleCancel}
            width={800}
            key="transaction_modal"
            footer={[]}
        >
            <div key={nanoid()}>
                {isNew ? (
                    <TransactionMenu initialData={isModalOpen.data} closeAction={handleCancel}  />
                ) : (
                    <TransactionModalMenu initialData={isModalOpen.data}  closeAction={handleCancel}  />
                )}
            </div>
        </Modal>
    );
};

export default FormModal;
