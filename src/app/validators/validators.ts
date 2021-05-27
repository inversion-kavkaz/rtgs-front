import {AbstractControl} from "@angular/forms";

/**
 * @author Dmitry Hvastunov
 * @created 27.05.2021
 * @project rtgs-front
 */

export function numberValidator(control : AbstractControl) : {[key: string] :any} | null {
  const checkValue = control.value
  let regexp = new RegExp('[0-9]\\*$'),
    test = regexp.test(checkValue);
  if(!test)
    return null
  else
    return {'numberValidator': true}
}
