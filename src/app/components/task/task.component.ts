import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Task } from '../../interfaces/task';

//angular material
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent implements OnInit {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly task = model(this.data.task);

  public taskForm!: FormGroup;

  public statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      id: [this.task().id],
      title: [this.task().title, Validators.required],
      status: [this.task().status, Validators.required],
      description: [this.task().description, Validators.required],
      dueDate: [this.task().dueDate, Validators.required],
    });
  }
}

export interface DialogData {
  task: Task;
}
