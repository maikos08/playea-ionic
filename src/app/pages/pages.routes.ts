import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
  {
    path:'beach/:slug',
    loadComponent: () => import('./beach-detail/beach-detail.component').then(m => m.BeachDetailComponent)

  }
] as Routes;
