import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'space'
})
export class SpacePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return  (value as string).replace(",", " ");
  }

}
