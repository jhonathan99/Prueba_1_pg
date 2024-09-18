import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Maquina } from 'src/app/Interfaces/maquina';
import { MaquinaService } from 'src/app/Services/maquina.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { ModalMaquinaComponent } from '../../Modales/modal-maquina/modal-maquina.component';

import Swal from 'sweetalert2';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-maquina',
  templateUrl: './maquina.component.html',
  styleUrls: ['./maquina.component.css']
})
export class MaquinaComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = ['descripcionPersona','codMaquina','nombre','costo','fechaAdquisicion','fechaSalida','estado', 'acciones'];
  dataInicio: Maquina[] = [];
  dataListaMaquinas = new MatTableDataSource<Maquina>(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _MaquinaServicio: MaquinaService,
    private _utilidadServicio: UtilidadService
  ) { }

  obtenerMaquinas() {
    this._MaquinaServicio.lista().subscribe({
      next: (data) => {
        console.log(data)
        if (data.status) {
          this.dataListaMaquinas.data = data.value;
          this.dataListaMaquinas.paginator = this.paginacionTabla;
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
        }
      },
      error: (e) => {}
    });
  }

  ngOnInit(): void {
    this.obtenerMaquinas();
  }

  getTotalCosto(): number {
    return this.dataListaMaquinas.filteredData
    .reduce((acc, curr) => acc + curr.costo, 0);
  }

  exportToExcel(): void {
    try {
      // Validar si hay datos filtrados disponibles
      const filteredData = this.dataListaMaquinas.filteredData;
      if (filteredData.length === 0) {
        this._utilidadServicio.mostrarAlerta("No hay datos para exportar", "Advertencia");
        return;
      }
  
      // Exportar solo los datos filtrados
      const exportData = filteredData.map(maquina => ({
        Colaborador: maquina.DescripcionPersona || 'N/A',
        codMaquina: maquina.codMaquina || 'N/A',
        nombre: maquina.nombre || 'N/A',
        costo: maquina.costo || 0,
        fechaAdquisicion: maquina.fechaAdquisicion ? new Date(maquina.fechaAdquisicion).toLocaleDateString() : 'N/A',
        fechaSalida: maquina.fechaSalida ? new Date(maquina.fechaSalida).toLocaleDateString() : 'N/A',
        Estado: maquina.esActivo === 1 ? 'Activo' : 'No activo'
      }));
  
      // Calcular el total del costo
      const totalCosto = filteredData.reduce((acc, maquina) => acc + (Number(maquina.costo) || 0), 0);
  
      // Agregar una fila extra con el total de costos
      exportData.push({
        Colaborador: 'Total',  // Etiqueta de total
        codMaquina: '',
        nombre: '',
        costo: totalCosto,  // Total calculado
        fechaAdquisicion: '',
        fechaSalida: '',
        Estado: ''
      });
  
      // Crear hoja de Excel con los datos exportados
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Máquinas');
  
      // Generar archivo Excel y descargarlo
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'reporte_maquinas');
    } catch (error) {
      console.error("Error durante la exportación a Excel: ", error);
      this._utilidadServicio.mostrarAlerta("Error durante la exportación a Excel", "Error");
    }
  }
  
  
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  ngAfterViewInit(): void {
    this.dataListaMaquinas.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaMaquinas.filter = filterValue.trim().toLowerCase();
    // Handle empty filter case
    if (this.dataListaMaquinas.paginator) {
      this.dataListaMaquinas.paginator.firstPage();
    }
  }
  
  aplicarFiltroEspecial(event: Event) {
    const checkboxActivas = document.getElementById('btncheckActivas') as HTMLInputElement;
    const checkboxNoActivas = document.getElementById('btncheckNoActivas') as HTMLInputElement;
  
    this.dataListaMaquinas.filterPredicate = (data: Maquina) => {
      const mostrarActivas = checkboxActivas.checked && data.esActivo === 1;
      const mostrarNoActivas = checkboxNoActivas.checked && data.esActivo === 0;
      
      if (checkboxActivas.checked && checkboxNoActivas.checked) {
        return true;
      }
  
      return mostrarActivas || mostrarNoActivas;
    };
  
    // Forzar la actualización del filtro
    this.dataListaMaquinas.filter = Math.random().toString(); // Forzar una actualización de la tabla
  
    if (this.dataListaMaquinas.paginator) {
      this.dataListaMaquinas.paginator.firstPage();
    }
  }
  

  nuevoMaquina() {
    this.dialog.open(ModalMaquinaComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerMaquinas();
    });
  }

  editarMaquina(maquina: Maquina) {
    this.dialog.open(ModalMaquinaComponent, {
      disableClose: true,
      data: maquina
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerMaquinas();
    });
  }
  
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
