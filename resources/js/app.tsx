import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent<ComponentType>(
            `./pages/${name}.tsx`,
            import.meta.glob<ComponentType>('./pages/**/*.tsx'),
        ),
    progress: {
        color: '#4B5563',
    },
});
