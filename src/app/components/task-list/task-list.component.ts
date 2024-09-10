import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Task } from '../../interfaces/task';

//angular material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortable, MatSortModule } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TaskService } from '../../services/task.service';
import { TaskComponent } from '../task/task.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    DatePipe,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  readonly task = signal({} as Task);
  public displayedColumns = new Array<string>();
  public dataSource!: MatTableDataSource<Task>;
  public screenWidth = window.innerWidth;

  // unsubscribe to all subscriptions
  private _subscription = new Subscription();

  readonly dialog = inject(MatDialog);

  constructor(
    private _taskService: TaskService,
    private _snackBarService: SnackbarService,
    private _cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._getTaskList();
    this.onResize({ target: window });
  }

  public addTask() {
    const newTask = {
      status: 'Pending',
      title: '',
      description: '',
      dueDate: new Date(),
    } as Task;
    this._openTaskForm(newTask);
  }

  public editTask(task: Task) {
    this._openTaskForm(task);
  }

  public deleteTask(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this._subscription.add;
      this._taskService.deleteTask(id).subscribe(() => {
        this.dataSource.data = this.dataSource.data.filter(
          (task) => task.id !== id
        );
        this._snackBarService.open('Task deleted successfully');
        this._cdRef.detectChanges();
      });
    }
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
    if (this.screenWidth < 600) {
      this.displayedColumns = ['status', 'title', 'actions'];
    } else {
      this.displayedColumns = [
        'status',
        'title',
        'description',
        'dueDate',
        'actions',
      ];
    }
    this._cdRef.detectChanges();
  }

  private _getTaskList() {
    this._subscription.add(
      this._taskService._getTaskList().subscribe((data: any) => {
        this.dataSource = new MatTableDataSource<Task>(data);
        this._cdRef.detectChanges();
        this._setDataSourceAttributes();
      })
    );
  }

  private _setDataSourceAttributes() {
    if (this.sort) {
      this.sort.sort({ id: 'status', start: 'asc' } as MatSortable);
    }
    this.dataSource.sort = this.sort;
  }

  private _openTaskForm(task: Task) {
    this.task.set(task);
    const dialogRef = this.dialog.open(TaskComponent, {
      data: { task: this.task() },
    });

    dialogRef.afterClosed().subscribe((result: Task) => {
      if (result?.id) {
        this._subscription.add(
          this._taskService.updateTask(result).subscribe(() => {
            if (this.dataSource.data.length > 0) {
              this.dataSource.data = this.dataSource.data.map((task) =>
                task.id === result.id ? result : task
              );
              this._snackBarService.open('Task updated successfully');
              this._cdRef.detectChanges();
            } else {
              this._getTaskList();
            }
          })
        );
      } else {
        this._subscription.add(
          this._taskService.addTask(result).subscribe((task) => {
            this.dataSource.data = [...this.dataSource.data, task];
            this._snackBarService.open('Task added successfully');
            this._cdRef.detectChanges();
          })
        );
      }
    });
  }

  ngOnDestroy() {
    this.dataSource?.disconnect();
    this._subscription.unsubscribe();
  }
}
