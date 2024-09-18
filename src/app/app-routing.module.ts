import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './home/home.component';
import { AcercaComponent } from './Components/acerca/acerca.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full'}, // Cambiado a HomeComponent
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'acerca', component: AcercaComponent, pathMatch: 'full' },
  { path: 'pages', loadChildren: () => import('./Components/layout/layout.module').then(m => m.LayoutModule),
    canActivate: [AuthGuard] 
   },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Cambiado para redirigir a HomeComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
