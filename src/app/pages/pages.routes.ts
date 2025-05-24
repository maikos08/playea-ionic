import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
] as Routes;
