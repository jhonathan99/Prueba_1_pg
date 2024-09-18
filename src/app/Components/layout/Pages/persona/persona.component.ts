import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Persona } from 'src/app/Interfaces/persona';
import { PersonaService } from 'src/app/Services/persona.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { ModalPersonaComponent } from '../../Modales/modal-persona/modal-persona.component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-persona',
  templateUrl: './persona.component.html',
  styleUrls: ['./persona.component.css']
})
export class PersonaComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = ['nombreCompleto', 'correo', 'rolDescripcion', 'estado', 'acciones'];
  dataInicio: Persona[] = [];
  dataListaPersonas = new MatTableDataSource<Persona>(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _personaServicio: PersonaService,
    private _utilidadServicio: UtilidadService
  ) { }

  obtenerPersonas() {
    this._personaServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          this.dataListaPersonas.data = data.value;
          this.dataListaPersonas.paginator = this.paginacionTabla;
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
        }
      },
      error: (e) => {}
    });
  }

  ngOnInit(): void {
    this.obtenerPersonas();
  }

  ngAfterViewInit(): void {
    this.dataListaPersonas.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaPersonas.filter = filterValue.trim().toLowerCase();
    if (this.dataListaPersonas.paginator) {
      this.dataListaPersonas.paginator.firstPage();
    }
  }

  aplicarFiltroEspecial(event: Event) {
    const checkboxActivas = document.getElementById('btncheckActivas') as HTMLInputElement;
    const checkboxNoActivas = document.getElementById('btncheckNoActivas') as HTMLInputElement;
  
    this.dataListaPersonas.filterPredicate = (data: Persona) => {
      const mostrarActivas = checkboxActivas.checked && data.esActivo === 1;
      const mostrarNoActivas = checkboxNoActivas.checked && data.esActivo === 0;
      
      if (checkboxActivas.checked && checkboxNoActivas.checked) {
        return true;
      }
  
      return mostrarActivas || mostrarNoActivas;
    };
  
    this.dataListaPersonas.filter = Math.random().toString();
  
    if (this.dataListaPersonas.paginator) {
      this.dataListaPersonas.paginator.firstPage();
    }
  }

  nuevoPersona() {
    this.dialog.open(ModalPersonaComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerPersonas();
    });
  }


  editarPersona(persona: Persona) {
    this.dialog.open(ModalPersonaComponent, {
      disableClose: true,
      data: persona
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerPersonas();
    });
  }

  resetearContra(correo: string): void {
    console.log('Correo a restablecer:', correo); // Verifica que el correo esté correcto
  
    this._personaServicio.restablecerContraseña(correo).subscribe({
      next: (response: any) => { // Asegúrate de que el tipo de respuesta sea correcto
        console.log('Respuesta del servidor:', response); // Muestra la respuesta del servidor
  
        if (response.message === 'Se ha enviado una nueva contraseña a tu correo electrónico.') {
          Swal.fire('Éxito', 'Contraseña restablecida y enviada por correo.', 'success');
        } else {
          Swal.fire('Error', 'No se pudo restablecer la contraseña.', 'error');
        }
        
      },
      error: (err) => {
        Swal.fire('Error', 'Ocurrió un error al restablecer la contraseña.', 'error');
      }
    });
  }
   
}
