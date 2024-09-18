import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { LayoutComponent } from './layout.component';
import { MaquinaComponent } from './Pages/maquina/maquina.component';
import { PersonaComponent } from './Pages/persona/persona.component';
import { ClienteComponent } from './Pages/cliente/cliente.component';
import { ColaboradorComponent } from './Pages/colaborador/colaborador.component';
import { DashBoardComponent } from './Pages/dash-board/dash-board.component';
import { PagoComponent } from './Pages/pago/pago.component';
import { PagoClienteComponent } from './Pages/pago-cliente/pago-cliente.component';
import { ReportePagoComponent } from './Pages/reporte-pago/reporte-pago.component';
import { PagoexitoComponent } from './Pages/pagoexito/pagoexito.component';

const routes: Routes = [{
  path:'',
  component:LayoutComponent,
  children: [
    {path:'maquinas',component:MaquinaComponent},
    {path:'personas',component:PersonaComponent},
    {path:'clientes',component:ClienteComponent},
    {path:'colaboradores',component:ColaboradorComponent},
    {path:'dashboard',component:DashBoardComponent},
    {path:'pagos',component:PagoComponent},
    {path:'pagosenlinea',component:PagoClienteComponent},
    {path:'reportes',component:ReportePagoComponent},
    {path:'pagoexito',component:PagoexitoComponent},
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
