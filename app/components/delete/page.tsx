import React from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Modal, Space } from 'antd';
import { deleteLineItem } from '@/app/function/action';


const { confirm } = Modal;

const showConfirm = () => {
  confirm({
    title: 'Do you want to delete these items?',
    icon: <ExclamationCircleFilled />,
    content: 'Some descriptions',
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
  });
};

const calldelete = async(id:any) => {
  // Add your delete logic here
  console.log('Delete operation started',id);
 const dd= await deleteLineItem(id)
 console.log('Delete operation completed',dd);
};
// const   showPromiseConfirm = (id:any) => {
//   confirm({
//     style:{width:'900px ' , marginTop:"100px"},
//     bodyStyle:{paddingTop:"5px"},
//     title: 'Do you want to Remove this item?',
//     icon: <ExclamationCircleFilled />,
// //    content: 'When clicked the OK button, this dialog will be closed after 1 second',
//     onOk() {
//       calldelete(id)
//       return new Promise((resolve, reject) => {
//         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
//       }).catch(() => console.log('Oops errors!'));
//     },
//     onCancel() {},
//   });
// };

const showDeleteConfirm = () => {
  confirm({
    title: 'Are you sure delete this task?',
    icon: <ExclamationCircleFilled />,
    content: 'Some descriptions',
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
  });
};

const showPropsConfirm = () => {
  confirm({
    title: 'Are you sure delete this task?',
    icon: <ExclamationCircleFilled />,
    content: 'Some descriptions',
    okText: 'Yes',
    okType: 'danger',
    okButtonProps: {
      disabled: true,
    },
    cancelText: 'No',
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
  });
};

const ItemRemove: React.FC = ({id}:any) => (
  <Space wrap>
  

  </Space>
);

export default ItemRemove;