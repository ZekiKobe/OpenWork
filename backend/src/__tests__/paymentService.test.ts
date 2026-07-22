import { PaymentService } from '../services/paymentService';

describe('PaymentService.calculateCommission', () => {
  it('calculates 10% platform fee', () => {
    const result = PaymentService.calculateCommission(100);
    expect(result.fee).toBe(10);
    expect(result.netAmount).toBe(90);
  });

  it('rounds fee and net amount to two decimal places', () => {
    const result = PaymentService.calculateCommission(33.33);
    expect(result.fee).toBe(3.33);
    expect(result.netAmount).toBe(30);
  });

  it('returns zero fee for zero amount', () => {
    const result = PaymentService.calculateCommission(0);
    expect(result.fee).toBe(0);
    expect(result.netAmount).toBe(0);
  });
});
