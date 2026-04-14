import { useContext } from 'react';
import { CaseContext } from '../context/CaseContext';

export function useCase() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within CaseProvider');
  }
  return context;
}
