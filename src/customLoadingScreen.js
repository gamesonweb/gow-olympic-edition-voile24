import { ILoadingScreen } from 'babylonjs';
import { GlobalManager } from './globalmanager';
import logoUrl from "../assets/images/logo.png";

class customLoadingScreen {
    imgUrl;
    loader;
    loaderContainer;
    logo;
    loadingbar;
    percent;

    constructor() {
        this.imgUrl = logoUrl;
        this.logo = document.getElementById('logo');
        this.loader = document.getElementById('loader');
        this.loaderContainer = document.getElementById('loaderContainer');
        this.loadingbar = document.getElementById('loadingbar');
        this.percent = document.getElementById('percent');

        this.logo.src = this.imgUrl;
    }
 
    displayLoadingUI() {
        this.loader.style.display = 'flex';
    }

    hideLoadingUI() {
        this.loader.style.display = 'none';
    }
}

export default customLoadingScreen;