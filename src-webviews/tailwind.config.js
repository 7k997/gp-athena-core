/** @type {import('tailwindcss').Config} */
export default {
    // import Notify from '../../../src/core/plugins/plugin-notifications/webview/Notify.vue';
    content: ['./index.html', './src/core/plugins/plugin-notifications/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
    // prefix: 'tw-',
};
