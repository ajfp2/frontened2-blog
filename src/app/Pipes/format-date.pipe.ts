import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
    transform(value: Date, ...args: number[]): unknown {
        // TODO 1
        let d = '';

        switch(args[0]){
            case 1: 
                d = formatDate(value, 'ddMMyyyy', 'en');
            break;
            case 2:
                d = formatDate(value, 'dd / MM / yyyy', 'en');
            break;
            case 3: 
                d = formatDate(value, 'dd/MM/yyyy', 'en');
            break;
            case 4: 
                d = formatDate(value, 'yyyy-MM-dd', 'en');
            break;
            default:  d = formatDate(value, 'dd/MM/yyyy', 'en'); break;
        }
        return d;
    }
}
