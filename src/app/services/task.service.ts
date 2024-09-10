import { Injectable } from '@angular/core';
import { Task } from '../interfaces/task';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor() {}

  public _getTaskList(): Observable<Task[]> {
    return new Observable((observer) => {
      const storedTaskList = localStorage.getItem('taskList');
      if (storedTaskList) {
        observer.next(JSON.parse(storedTaskList));
      } else {
        const taskList = this._initTaskList();
        localStorage.setItem('taskList', JSON.stringify(taskList));
        observer.next(taskList);
      }
    });
  }

  public addTask(task: Task): Observable<Task> {
    // Generate a unique id for the task
    task['id'] = this._generateId();

    return new Observable((observer) => {
      const storedTaskList = localStorage.getItem('taskList');
      if (storedTaskList) {
        const taskList = JSON.parse(storedTaskList);
        taskList.push(task);
        localStorage.setItem('taskList', JSON.stringify(taskList));
        observer.next(task);
      }
    });
  }

  public updateTask(task: Task): Observable<Task> {
    return new Observable((observer) => {
      const storedTaskList = localStorage.getItem('taskList');
      if (storedTaskList) {
        const taskList = JSON.parse(storedTaskList);
        const index = taskList.findIndex((t: Task) => t.id === task.id);
        taskList[index] = task;
        localStorage.setItem('taskList', JSON.stringify(taskList));
        observer.next(task);
      }
    });
  }

  public deleteTask(id: number): Observable<number> {
    return new Observable((observer) => {
      const storedTaskList = localStorage.getItem('taskList');
      if (storedTaskList) {
        const taskList = JSON.parse(storedTaskList);
        const index = taskList.findIndex((t: Task) => t.id === id);
        taskList.splice(index, 1);
        localStorage.setItem('taskList', JSON.stringify(taskList));
        observer.next(id);
      }
    });
  }

  private _generateId(): number {
    const storedTaskList = localStorage.getItem('taskList');
    if (storedTaskList && JSON.parse(storedTaskList).length) {
      const taskList = JSON.parse(storedTaskList);
      return taskList[taskList.length - 1].id + 1;
    }
    return 1;
  }

  private _initTaskList(): Task[] {
    return [
      {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        dueDate: new Date('2021-12-31'),
        status: 'Pending',
      },
      {
        id: 2,
        title: 'Task 2',
        description: 'Description 2',
        dueDate: new Date('2021-12-31'),
        status: 'Pending',
      },
      {
        id: 3,
        title: 'Task 3',
        description: 'Description 3',
        dueDate: new Date('2021-12-31'),
        status: 'Pending',
      },
    ];
  }
}
