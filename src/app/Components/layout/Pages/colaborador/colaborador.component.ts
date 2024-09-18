import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Colaborador } from 'src/app/Interfaces/colaborador';
import { ColaboradorService } from 'src/app/Services/colaborador.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { ModalColaboradorComponent } from '../../Modales/modal-colaborador/modal-colaborador.component';

@Component({
  selector: 'app-colaborador',
  templateUrl: './colaborador.component.html',
  styleUrls: ['./colaborador.component.css']
})
export class ColaboradorComponent implements OnInit {

  columnasTabla: string[] = ['descripcionPersona','descripcionFechaNacimiento','salario','fechaInicio','fechaFin','estado','acciones'];
  dataInicio: Colaborador[] = [];
  dataListaColaboradores = new MatTableDataSource<Colaborador>(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  
  constructor(
    private dialog: MatDialog,
    private _colaboradorServicio: ColaboradorService,
    private _utilidadServicio: UtilidadService
  ) { }

  obtenerColaboradores() {
    this._colaboradorServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          this.dataListaColaboradores.data = data.value;
          this.dataListaColaboradores.paginator = this.paginacionTabla;
          console.log(data.value)
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
        }
      },
      error: (e) => {}
    });
  }

  ngOnInit(): void {
    this.obtenerColaboradores();
  }
  ngAfterViewInit(): void {
    this.dataListaColaboradores.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaColaboradores.filter = filterValue.trim().toLowerCase();
    // Handle empty filter case
    if (this.dataListaColaboradores.paginator) {
      this.dataListaColaboradores.paginator.firstPage();
    }
  }

  aplicarFiltroEspecial(event: Event) {
    const checkboxActivas = document.getElementById('btncheckActivas') as HTMLInputElement;
    const checkboxNoActivas = document.getElementById('btncheckNoActivas') as HTMLInputElement;
  
    this.dataListaColaboradores.filterPredicate = (data: Colaborador) => {
      const mostrarActivas = checkboxActivas.checked && data.esActivo === 1;
      const mostrarNoActivas = checkboxNoActivas.checked && data.esActivo === 0;
      
      if (checkboxActivas.checked && checkboxNoActivas.checked) {
        return true;
      }
  
      return mostrarActivas || mostrarNoActivas;
    };
  
    // Forzar la actualización del filtro
    this.dataListaColaboradores.filter = Math.random().toString(); // Forzar una actualización de la tabla
  
    if (this.dataListaColaboradores.paginator) {
      this.dataListaColaboradores.paginator.firstPage();
    }
  }
  
  nuevoColaborador() {
    this.dialog.open(ModalColaboradorComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerColaboradores();
    });
  }

  editarColaborador(colaborador: Colaborador) {
    this.dialog.open(ModalColaboradorComponent, {
      disableClose: true,
      data: colaborador
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerColaboradores();
    });
  }

}
