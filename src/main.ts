import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideIonicAngular(), provideFirebaseApp(() => initializeApp({ projectId: "playea-eu", appId: "1:706207252910:web:9f3c1c1b2d107c400a883f", storageBucket: "playea-eu.firebasestorage.app", apiKey: "AIzaSyDekO0aTS3WZL2ocg9Kb1ewNTZ7FjRpBGs", authDomain: "playea-eu.firebaseapp.com", messagingSenderId: "706207252910", measurementId: "G-MYWVFD58B8" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
  ],
});
