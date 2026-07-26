import FarmForm from '@/components/forms/FarmForm';
import type { Farm } from '@/types';

interface FarmEditPageProps {
    farm: Farm;
    readOnly: boolean;
}

export default function FarmEditPage({ farm, readOnly }: FarmEditPageProps) {
    return <FarmForm farm={farm} readOnly={readOnly} />;
}
