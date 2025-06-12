import './bootstrap';
import { registerReactControllerComponents } from '@symfony/ux-react';
import jQuery from 'jquery';

const result = require.context('./react/controllers', true, /\.(j|t)sx?$/);
registerReactControllerComponents(result);

console.log('React components registered successfully.');

import "./styles/app.css";


console.log('App.js loaded successfully.', jQuery);

// Make jQuery available globally for inline scripts in Twig templates
global.jQuery = jQuery;
global.$ = jQuery;
window.jQuery = jQuery;
window.$ = jQuery;

