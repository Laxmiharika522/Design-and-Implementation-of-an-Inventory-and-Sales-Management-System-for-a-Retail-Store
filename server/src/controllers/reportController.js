import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Revenue
    const [rev] = await pool.query('SELECT SUM(grand_total) as total FROM sales_transaction');
    const totalRevenueResult = rev[0].total;
    
    // 2. Total Sales count today
    const [dailySales] = await pool.query('SELECT COUNT(*) as count FROM sales_transaction WHERE DATE(transaction_date) = CURDATE()');
    const dailySalesCount = dailySales[0].count;

    // 3. Low stock alerts
    const [inventoryRows] = await pool.query(`
      SELECT 
        i.inventory_id, i.product_id, i.current_stock, i.expiry_date, i.warehouse_id,
        p.product_name,
        pr.reorder_level
      FROM inventory i
      JOIN product p ON i.product_id = p.product_id
      LEFT JOIN product_reorder pr ON i.product_id = pr.product_id AND (pr.warehouse_id = i.warehouse_id OR i.warehouse_id IS NULL)
    `);
    
    const lowStockItems = inventoryRows.filter(item => {
      const reorderLevel = item.reorder_level ?? 10;
      return item.current_stock <= reorderLevel;
    }).map(item => ({
      ...item,
      Product: { product_name: item.product_name }
    }));

    // 4. Expiring Soon (Next 30 days) & Already Expired
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    const expiringSoonItems = inventoryRows.filter(item => {
      return item.expiry_date && new Date(item.expiry_date) <= thirtyDaysFromNow && new Date(item.expiry_date) > now;
    });

    const expiredItems = inventoryRows.filter(item => {
      return item.expiry_date && new Date(item.expiry_date) <= now;
    });

    // 5. Recent transactions
    const [recentTransactions] = await pool.query(`
      SELECT * FROM sales_transaction 
      ORDER BY transaction_date DESC 
      LIMIT 5
    `);

    const { period } = req.query; // 'this_month' or 'last_month'
    let dateFilter = 'WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'; // Default 30 days

    if (period === 'last_month') {
      dateFilter = 'WHERE YEAR(transaction_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND MONTH(transaction_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)';
    } else if (period === 'this_month') {
      dateFilter = 'WHERE YEAR(transaction_date) = YEAR(CURRENT_DATE) AND MONTH(transaction_date) = MONTH(CURRENT_DATE)';
    }

    // 6. Daily Sales Trend (Group by Date)
    const [monthlySales] = await pool.query(`
      SELECT 
        DATE(transaction_date) as month, 
        SUM(grand_total) as total 
      FROM sales_transaction 
      ${dateFilter}
      GROUP BY DATE(transaction_date)
      ORDER BY month ASC
    `);

    res.json({
      totalRevenue: totalRevenueResult || 0,
      dailySalesCount,
      lowStockCount: lowStockItems.length,
      expiringSoonCount: expiringSoonItems.length,
      expiredCount: expiredItems.length,
      lowStockItems,
      expiringSoonItems,
      expiredItems,
      recentTransactions,
      monthlySales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const [inventoryRows] = await pool.query(`
      SELECT 
        i.inventory_id, i.product_id, i.current_stock, i.expiry_date,
        p.product_name, p.image_url,
        pr.reorder_level
      FROM inventory i
      JOIN product p ON i.product_id = p.product_id
      LEFT JOIN product_reorder pr ON i.product_id = pr.product_id
    `);
    
    const lowStockItems = [];
    const expiredItems = [];
    const now = new Date();

    for (const item of inventoryRows) {
      const reorderLevel = item.reorder_level ?? 10;
      if (item.current_stock <= reorderLevel) {
        lowStockItems.push(item);
      }
      if (item.expiry_date && new Date(item.expiry_date) <= now) {
        expiredItems.push(item);
      }
    }

    res.json({
      lowStockCount: lowStockItems.length,
      expiredCount: expiredItems.length,
      alerts: [
        ...lowStockItems.map(item => ({
          id: `lowstock-${item.inventory_id}`,
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${item.product_name} is running low (${item.current_stock} left)`,
          time: new Date().toISOString()
        })),
        ...expiredItems.map(item => ({
          id: `expired-${item.inventory_id}`,
          type: 'danger',
          title: 'Product Expired',
          message: `${item.product_name} expired on ${new Date(item.expiry_date).toLocaleDateString()}`,
          time: item.expiry_date
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
};

export const getDetailedSales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        st.transaction_id, st.transaction_date, st.employee_id, st.customer_id, st.grand_total, st.payment_type_id,
        c.customer_name, c.email, c.phone,
        e.employee_name, e.role,
        stf.payment_processing_fee,
        pay.payment_method,
        std.quantity_sold, std.unit_price, std.tax_category,
        p.product_name,
        str.tax_rate
      FROM sales_transaction st
      LEFT JOIN customer c ON st.customer_id = c.customer_id
      LEFT JOIN employee e ON st.employee_id = e.employee_id
      LEFT JOIN sales_transaction_fees stf ON st.payment_type_id = stf.payment_type_id
      LEFT JOIN payment pay ON st.transaction_id = pay.transaction_id
      LEFT JOIN sales_transaction_details std ON st.transaction_id = std.transaction_id
      LEFT JOIN product p ON std.product_id = p.product_id
      LEFT JOIN sales_transaction_rates str ON std.tax_category = str.tax_category
      ORDER BY st.transaction_date DESC
    `);

    const salesMap = new Map();
    for (const row of rows) {
      if (!salesMap.has(row.transaction_id)) {
        salesMap.set(row.transaction_id, {
          transaction_id: row.transaction_id,
          transaction_date: row.transaction_date,
          is_online: !row.employee_id,
          grand_total: parseFloat(row.grand_total || 0),
          customer: row.customer_id ? {
            id: Number(row.customer_id),
            name: row.customer_name,
            email: row.email,
            phone: row.phone
          } : { id: null, name: 'Guest' },
          employee: row.employee_id ? {
            id: row.employee_id,
            name: row.employee_name,
            role: row.role
          } : { id: null, name: 'System', role: 'N/A' },
          items: [],
          subtotal: 0,
          tax_amount: 0,
          processing_fee: 0,
          payment_method: row.payment_method || 'Unknown',
          _processing_fee_rate: row.payment_processing_fee ? parseFloat(row.payment_processing_fee) / 100 : 0
        });
      }
      
      const sale = salesMap.get(row.transaction_id);
      
      if (row.product_name) {
        const qty = row.quantity_sold;
        const price = parseFloat(row.unit_price);
        const lineSubtotal = qty * price;
        const taxRate = row.tax_rate ? parseFloat(row.tax_rate) / 100 : 0;
        const lineTax = lineSubtotal * taxRate;

        sale.subtotal += lineSubtotal;
        sale.tax_amount += lineTax;

        sale.items.push({
          product_name: row.product_name || 'Unknown Product',
          quantity: qty,
          unit_price: price,
          tax_rate: taxRate * 100,
          tax_amount: lineTax,
          line_total: lineSubtotal + lineTax
        });
      }
    }
    
    // Finalize fee and total calculations per transaction (only for sub-breakdown)
    const detailedSales = Array.from(salesMap.values()).map(sale => {
      // The grand_total is already set from the DB in the first pass
      // We calculate processing_fee from the subtotal+tax for the breakdown view
      const processingFee = (sale.subtotal + sale.tax_amount) * sale._processing_fee_rate;
      sale.processing_fee = processingFee;
      delete sale._processing_fee_rate;
      return sale;
    });

    const totalStoreEarnings = detailedSales.reduce((sum, sale) => sum + sale.grand_total, 0);


    res.json({
      sales: detailedSales,
      totalStoreEarnings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating detailed sales report' });
  }
};

export const getEmployeeStats = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // 1. Get Employee Info (Role, Name)
    const [empRows] = await pool.query(
      'SELECT employee_name, role FROM employee WHERE employee_id = ?',
      [employeeId]
    );
    
    if (empRows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { employee_name, role } = empRows[0];

    // 2. Count Transactions for this employee
    const [statsRows] = await pool.query(
      'SELECT COUNT(*) as count, SUM(grand_total) as total_value FROM sales_transaction WHERE employee_id = ?',
      [employeeId]
    );

    const transactionCount = statsRows[0].count || 0;
    const totalSalesValue = statsRows[0].total_value || 0;

    // 3. Transactions Today
    const [todayRows] = await pool.query(
      'SELECT COUNT(*) as count FROM sales_transaction WHERE employee_id = ? AND DATE(transaction_date) = CURDATE()',
      [employeeId]
    );
    const transactionsToday = todayRows[0].count || 0;

    // 4. Accuracy Rate (Successful vs Failed Payments)
    const [paymentStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN payment_status = 'Completed' THEN 1 ELSE 0 END) as successful
      FROM payment p
      JOIN sales_transaction st ON p.transaction_id = st.transaction_id
      WHERE st.employee_id = ?`,
      [employeeId]
    );
    
    const totalPayments = paymentStats[0].total || 0;
    const successfulPayments = paymentStats[0].successful || 0;
    const accuracyRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 100;

    // 5. Get Recent Transactions for this employee
    const [recentTxns] = await pool.query(
      'SELECT transaction_id, transaction_date, grand_total FROM sales_transaction WHERE employee_id = ? ORDER BY transaction_date DESC LIMIT 5',
      [employeeId]
    );

    res.json({
      employee_id: employeeId,
      name: employee_name,
      role: role,
      transactionCount,
      totalSalesValue,
      transactionsToday,
      accuracyRate: Math.round(accuracyRate),
      dailyTarget: 20, // Example target
      recentTransactions: recentTxns
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
