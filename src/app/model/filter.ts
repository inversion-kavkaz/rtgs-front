export interface Filter {
  startDate: Date | null
  endDate: Date | null
  login: string | null
  sum: number | null
  payerPersonalAcc: string | null
  payerCorrespAcc: string | null
  payeePersonalAcc: string | null
  payeeCorrespAcc: string | null
  purpose: string | null
  payerName: string | null
  payeeName: string | null
  currency : string | null
  status : number | null
}
