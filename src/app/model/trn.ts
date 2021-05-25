export interface Trn {
  position: number
  id: number
  edNo: number
  edAuthor: string
  edReceiver: string
  transKind: string
  priority: number
  sum: number
  payerPersonalAcc: string
  payerINN: string
  payerCorrespAcc: string
  payeePersonalAcc: string
  payeeINN: string
  payeeCorrespAcc: string
  userId: number
  purpose: string
  edDate: Date
  payerName: string
  payeeName: string
  currency : string

}
