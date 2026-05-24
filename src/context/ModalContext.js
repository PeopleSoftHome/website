import { createContext, useContext } from 'react';

/**
 * ModalContext — 全局预约演示弹窗状态
 * 任意层级组件通过 useModalContext() 调用 openModal
 */
export const ModalContext = createContext({
  isOpen:     false,
  step:       0,
  isSuccess:  false,
  openModal:  () => {},
  closeModal: () => {},
  nextStep:   () => {},
  submitForm: () => {},
});

export function useModalContext() {
  return useContext(ModalContext);
}
