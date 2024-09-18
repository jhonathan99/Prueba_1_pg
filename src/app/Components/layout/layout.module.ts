import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { MaquinaComponent } from './Pages/maquina/maquina.component';
import { SharedModule } from 'src/app/Reutilizable/shared/shared.module';
import { ModalMaquinaComponent } from './Modales/modal-maquina/modal-maquina.component';
import { PersonaComponent } from './Pages/persona/persona.component';
import { ModalPersonaComponent } from './Modales/modal-persona/modal-persona.component';
import { ModalClienteComponent } from './Modales/modal-cliente/modal-cliente.component';
import { ClienteComponent } from './Pages/cliente/cliente.component';
import { ColaboradorComponent } from './Pages/colaborador/colaborador.component';
import { ModalColaboradorComponent } from './Modales/modal-colaborador/modal-colaborador.component';
import { PagoComponent } from './Pages/pago/pago.component';
import { PagoClienteComponent } from './Pages/pago-cliente/pago-cliente.component';
import { DashBoardComponent } from './Pages/dash-board/dash-board.component';
import { ReportePagoComponent } from './Pages/reporte-pago/reporte-pago.component';
import { PagoexitoComponent } from './Pages/pagoexito/pagoexito.component';
import { ModalPagosComponent } from './Modales/modal-pagos/modal-pagos.component';

@NgModule({
  declarations: [
    MaquinaComponent,
    ModalMaquinaComponent,
    PersonaComponent,
    ModalPersonaComponent,
    ModalClienteComponent,
    ClienteComponent,
    ColaboradorComponent,
    ModalColaboradorComponent,
    PagoComponent,
    PagoClienteComponent,
    DashBoardComponent,
    ReportePagoComponent,
    PagoexitoComponent,
    ModalPagosComponent,

  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,

    SharedModule
  ]
})
export class LayoutModule { }
