import FertilizerPredictionForm from '@/components/forms/FertilizerPredictionForm';
import type { FertilizerPredictionFormOptions } from '@/components/forms/FertilizerPredictionForm';

interface FertilizerPredictionCreatePageProps {
    formOptions: FertilizerPredictionFormOptions;
}

export default function FertilizerPredictionCreatePage({ formOptions }: FertilizerPredictionCreatePageProps) {
    return <FertilizerPredictionForm formOptions={formOptions} />;
}
