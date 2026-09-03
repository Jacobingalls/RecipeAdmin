import '@testing-library/jest-dom';

// Configures i18next, so components under test resolve messages to real text instead of
// rendering raw keys. The app does the same from App.tsx.
import '../i18n';
