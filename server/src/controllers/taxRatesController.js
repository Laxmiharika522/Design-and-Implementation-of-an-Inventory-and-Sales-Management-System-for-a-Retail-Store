import pool from '../config/db.js';

export const getTaxRates = async (req, res) => {
  try {
    const [rates] = await pool.query('SELECT * FROM sales_transaction_rates');
    const [fees] = await pool.query('SELECT * FROM sales_transaction_fees');

    const rateMap = {};
    rates.forEach(r => {
      rateMap[r.tax_category] = parseFloat(r.tax_rate);
    });

    const feeMap = {};
    fees.forEach(f => {
      feeMap[f.payment_type_id] = parseFloat(f.payment_processing_fee);
    });

    res.json({
      rates: rateMap,
      fees: feeMap
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching lookup data' });
  }
};
