import './css/main.css';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
//import "../node_modules/bootstrap/dist/js/bootstrap.js";

import Alpine from 'alpinejs';
import swipePlugin from "alpinejs-swipe";
import flickr from './flickr.js';

Alpine.data('flickr', flickr);

window.Alpine = Alpine
Alpine.plugin(swipePlugin);
Alpine.start()
