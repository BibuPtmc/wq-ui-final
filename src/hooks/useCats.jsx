import { useCatsContext } from '../contexts/CatsContext';

export const useCats = () => {
  return useCatsContext();
};
