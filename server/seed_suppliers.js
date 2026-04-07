/**
 * Supplier Portal Seed Script
 * Creates: supplier addresses, bank details, contacts, links products, creates POs + delivery details
 */

import('./src/models/index.js').then(async ({
  sequelize, Supplier, SupplierAddress, SupplierBankDetails, SupplierContact,
  Product, PurchaseOrder, PurchaseOrderDetail, DeliveryDetails
}) => {
  try {
    console.log('🌱 Starting Supplier Portal seed...');

    // ────────────────────────────────────────────
    // 1. Supplier Addresses (pincodes)
    // ────────────────────────────────────────────
    const addresses = [
      { pincode: '400001', city: 'Mumbai', state: 'Maharashtra' },
      { pincode: '560001', city: 'Bangalore', state: 'Karnataka' },
      { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu' },
      { pincode: '110001', city: 'New Delhi', state: 'Delhi' },
    ];
    for (const a of addresses) {
      await SupplierAddress.upsert(a);
    }
    console.log('✅ Supplier addresses seeded');

    // ────────────────────────────────────────────
    // 2. Supplier Bank Details
    // ────────────────────────────────────────────
    const banks = [
      { bank_account_number: 'SBI001234567890', ifsc_code: 'SBIN0001234', branch_name: 'Mumbai Main', bank_name: 'State Bank of India' },
      { bank_account_number: 'HDFC009876543210', ifsc_code: 'HDFC0009876', branch_name: 'Bangalore Central', bank_name: 'HDFC Bank' },
      { bank_account_number: 'ICICI001122334455', ifsc_code: 'ICIC0001122', branch_name: 'Chennai North', bank_name: 'ICICI Bank' },
      { bank_account_number: 'AXIS006677889900', ifsc_code: 'UTIB0006677', branch_name: 'Delhi Connaught', bank_name: 'Axis Bank' },
    ];
    for (const b of banks) {
      await SupplierBankDetails.upsert(b);
    }
    console.log('✅ Bank details seeded');

    // ────────────────────────────────────────────
    // 3. Update existing supplier (id=1) with bank & pincode
    // ────────────────────────────────────────────
    await Supplier.update(
      { pincode: '600001', bank_account_number: 'SBI001234567890' },
      { where: { supplier_id: 1 } }
    );

    // ────────────────────────────────────────────
    // 4. Create 3 more suppliers
    // ────────────────────────────────────────────
    const bcrypt = await import('bcrypt');

    const suppliersToCreate = [
      {
        supplier_name: 'FreshFarms Agro',
        email: 'freshfarms@supply.com',
        password: await bcrypt.default.hash('supplier123', 10),
        pincode: '400001',
        bank_account_number: 'HDFC009876543210',
      },
      {
        supplier_name: 'NutriPack Industries',
        email: 'nutripack@supply.com',
        password: await bcrypt.default.hash('supplier123', 10),
        pincode: '560001',
        bank_account_number: 'ICICI001122334455',
      },
      {
        supplier_name: 'CleanCo Distributors',
        email: 'cleanco@supply.com',
        password: await bcrypt.default.hash('supplier123', 10),
        pincode: '110001',
        bank_account_number: 'AXIS006677889900',
      },
    ];

    const createdSuppliers = [];
    for (const s of suppliersToCreate) {
      const [sup, created] = await Supplier.findOrCreate({
        where: { email: s.email },
        defaults: s
      });
      createdSuppliers.push(sup);
      if (created) console.log(`  ➕ Created supplier: ${sup.supplier_name} (ID: ${sup.supplier_id})`);
      else console.log(`  ↩️  Supplier exists: ${sup.supplier_name} (ID: ${sup.supplier_id})`);
    }

    const [supplier2, supplier3, supplier4] = createdSuppliers;

    // Add contacts for all suppliers
    const contacts = [
      { supplier_id: 1, phone: '9876543210' },
      { supplier_id: 1, phone: '9876543211' },
      { supplier_id: supplier2.supplier_id, phone: '9123456780' },
      { supplier_id: supplier3.supplier_id, phone: '9234567890' },
      { supplier_id: supplier4.supplier_id, phone: '9345678901' },
    ];
    for (const c of contacts) {
      await SupplierContact.findOrCreate({ where: c, defaults: c });
    }
    console.log('✅ Supplier contacts seeded');

    // ────────────────────────────────────────────
    // 5. Assign products to suppliers by category
    // ────────────────────────────────────────────
    const allProducts = await Product.findAll({ include: [{ association: 'Category' }] });

    for (const p of allProducts) {
      const cat = p.Category?.category_name || '';
      let assignedSupplierId = 1; // default: laxmi (Grocery & Dairy)

      if (['Fruits & Vegetables', 'Dairy Products', 'Bakery & Bread'].includes(cat)) {
        assignedSupplierId = supplier2.supplier_id; // FreshFarms
      } else if (['Snacks & Packaged Foods', 'Beverages', 'Health & Wellness', 'Baby & Kids Products'].includes(cat)) {
        assignedSupplierId = supplier3.supplier_id; // NutriPack
      } else if (['Personal Care', 'Household & Cleaning'].includes(cat)) {
        assignedSupplierId = supplier4.supplier_id; // CleanCo
      }

      await Product.update({ supplier_id: assignedSupplierId }, { where: { product_id: p.product_id } });
    }
    console.log(`✅ Assigned ${allProducts.length} products to suppliers by category`);

    // ────────────────────────────────────────────
    // 6. Create Purchase Orders
    // ────────────────────────────────────────────
    const groceryProducts = allProducts.filter(p => ['Grocery & Staples'].includes(p.Category?.category_name)).slice(0, 3);
    const freshProducts = allProducts.filter(p => ['Fruits & Vegetables'].includes(p.Category?.category_name)).slice(0, 3);
    const snackProducts = allProducts.filter(p => ['Snacks & Packaged Foods'].includes(p.Category?.category_name)).slice(0, 3);
    const cleanProducts = allProducts.filter(p => ['Personal Care', 'Household & Cleaning'].includes(p.Category?.category_name)).slice(0, 3);

    const poData = [
      { supplier_id: 1, status: 'Delivered', order_date: '2026-03-01', delivery_date: '2026-03-07', products: groceryProducts, qty: 50 },
      { supplier_id: 1, status: 'Shipped', order_date: '2026-03-15', delivery_date: '2026-03-22', products: groceryProducts.slice(0, 2), qty: 30 },
      { supplier_id: 1, status: 'Pending', order_date: '2026-03-20', delivery_date: null, products: groceryProducts.slice(0, 2), qty: 100 },
      { supplier_id: supplier2.supplier_id, status: 'Delivered', order_date: '2026-03-05', delivery_date: '2026-03-10', products: freshProducts, qty: 200 },
      { supplier_id: supplier2.supplier_id, status: 'In Progress', order_date: '2026-03-18', delivery_date: '2026-03-25', products: freshProducts.slice(0, 2), qty: 150 },
      { supplier_id: supplier3.supplier_id, status: 'Delivered', order_date: '2026-03-02', delivery_date: '2026-03-06', products: snackProducts, qty: 80 },
      { supplier_id: supplier3.supplier_id, status: 'Pending', order_date: '2026-03-21', delivery_date: null, products: snackProducts.slice(0, 2), qty: 60 },
      { supplier_id: supplier4.supplier_id, status: 'Shipped', order_date: '2026-03-12', delivery_date: '2026-03-19', products: cleanProducts, qty: 40 },
    ];

    for (const po of poData) {
      if (po.products.length === 0) {
        console.log(`  ⚠️  Skipping PO for supplier ${po.supplier_id} - no products found`);
        continue;
      }

      const totalAmount = po.products.reduce((sum, p) => sum + (parseFloat(p.unit_price) * po.qty), 0);

      const order = await PurchaseOrder.create({
        supplier_id: po.supplier_id,
        status: po.status,
        order_date: po.order_date,
        delivery_date: po.delivery_date,
        total_amount: totalAmount,
      });

      // Order details
      for (const [i, product] of po.products.entries()) {
        await PurchaseOrderDetail.findOrCreate({
          where: { po_id: order.po_id, product_id: product.product_id },
          defaults: {
            quantity_ordered: po.qty,
            batch_no: `BATCH-${order.po_id}-${String(i + 1).padStart(2, '0')}`,
          }
        });
      }

      // Delivery Details for shipped/delivered orders
      if (['Shipped', 'Delivered', 'In Progress'].includes(po.status)) {
        const modes = ['Truck', 'Courier', 'Van', 'Rail'];
        const agents = ['Ramesh Kumar', 'Priya Sharma', 'Anand Patel', 'Kavitha Rao'];
        const modeIdx = poData.indexOf(po) % modes.length;

        await DeliveryDetails.upsert({
          po_id: order.po_id,
          shipping_mode: modes[modeIdx],
          purchase_agent_name: agents[modeIdx],
        });
      }

      console.log(`  ✅ PO #${order.po_id} — supplier ${po.supplier_id} — ₹${totalAmount.toFixed(0)} — ${po.status}`);
    }

    console.log('\n✅✅ Supplier Portal data seeded successfully!');
    console.log('\n📋 Supplier Credentials:');
    console.log('  laxmi (Grocery & Staples)  | Email: supplier1@logistics.com  | Pass: supplier123');
    console.log('  FreshFarms Agro            | Email: freshfarms@supply.com    | Pass: supplier123');
    console.log('  NutriPack Industries       | Email: nutripack@supply.com     | Pass: supplier123');
    console.log('  CleanCo Distributors       | Email: cleanco@supply.com       | Pass: supplier123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
});
