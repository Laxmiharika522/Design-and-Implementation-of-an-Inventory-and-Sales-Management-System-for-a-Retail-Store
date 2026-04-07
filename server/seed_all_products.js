import pool from './src/config/db.js';
import bcrypt from 'bcrypt';

const allProducts = [
  {
    "name": "Basmati Rice (1kg)",
    "price": 180,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    "exp": 365,
    "barcode": "890100000001",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Boiled Rice (1kg)",
    "price": 60,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    "exp": 365,
    "barcode": "890100000002",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Wheat Flour - Atta (1kg)",
    "price": 85,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1612257998531-c0e2e17c8c01?w=400",
    "exp": 180,
    "barcode": "890100000003",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Maida (1kg)",
    "price": 55,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1612257998531-c0e2e17c8c01?w=400",
    "exp": 180,
    "barcode": "890100000004",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Rava / Sooji (500g)",
    "price": 60,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1612257998531-c0e2e17c8c01?w=400",
    "exp": 180,
    "barcode": "890100000005",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Oats (500g)",
    "price": 120,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=400",
    "exp": 180,
    "barcode": "890100000006",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Toor Dal (500g)",
    "price": 140,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1608440512889-ea6b7de5f6fb?w=400",
    "exp": 365,
    "barcode": "890100000007",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Moong Dal (500g)",
    "price": 130,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1608440512889-ea6b7de5f6fb?w=400",
    "exp": 365,
    "barcode": "890100000008",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Chana Dal (500g)",
    "price": 90,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1608440512889-ea6b7de5f6fb?w=400",
    "exp": 365,
    "barcode": "890100000009",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Sugar (1kg)",
    "price": 45,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=400",
    "exp": 730,
    "barcode": "890100000010",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Salt (1kg)",
    "price": 20,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1626078299034-ade5fc4e6cf3?w=400",
    "exp": 730,
    "barcode": "890100000011",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Jaggery (500g)",
    "price": 70,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607629088083-7b4bdc0d6af8?w=400",
    "exp": 365,
    "barcode": "890100000012",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Sunflower Oil (1L)",
    "price": 185,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400",
    "exp": 365,
    "barcode": "890100000013",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Groundnut Oil (1L)",
    "price": 200,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400",
    "exp": 365,
    "barcode": "890100000014",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Coconut Oil (500ml)",
    "price": 220,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400",
    "exp": 365,
    "barcode": "890100000015",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Turmeric Powder (100g)",
    "price": 60,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400",
    "exp": 365,
    "barcode": "890100000016",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Red Chilli Powder (100g)",
    "price": 70,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1508747703725-719777637510?w=400",
    "exp": 365,
    "barcode": "890100000017",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Garam Masala (100g)",
    "price": 80,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1685532537-09dbb22dc028?w=400",
    "exp": 365,
    "barcode": "890100000018",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Coriander Powder (100g)",
    "price": 45,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1685532537-09dbb22dc028?w=400",
    "exp": 365,
    "barcode": "890100000019",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Almonds (200g)",
    "price": 320,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.healthshots.com/healthshots/en/uploads/2023/09/07023334/almonds.jpg",
    "exp": 180,
    "barcode": "890100000020",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cashews (200g)",
    "price": 550,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1630696424053-ba3af29bfd33?w=400",
    "exp": 180,
    "barcode": "890100000021",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Raisins (200g)",
    "price": 80,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=400",
    "exp": 180,
    "barcode": "890100000022",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Dry Fruits Mix (200g)",
    "price": 250,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1574570069765-15278b0ce1f3?w=400",
    "exp": 180,
    "barcode": "890100000023",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Peanut Butter (500g)",
    "price": 250,
    "category_id": 1,
    "category_name": "Grocery & Staples",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1523498483-59d6a38aeb86?w=400",
    "exp": 365,
    "barcode": "890100000024",
    "hsn_code": "1006",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Apple (1kg)",
    "price": 180,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=400",
    "exp": 14,
    "barcode": "890200000025",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Banana (1 dozen)",
    "price": 60,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=400",
    "exp": 7,
    "barcode": "890200000026",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Orange (1kg)",
    "price": 90,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1547514701-42782101795e?w=400",
    "exp": 10,
    "barcode": "890200000027",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Mango (1kg)",
    "price": 150,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
    "exp": 7,
    "barcode": "890200000028",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Grapes (500g)",
    "price": 120,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1537640538966-94adbee34f51?w=400",
    "exp": 7,
    "barcode": "890200000029",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Watermelon (1 pc)",
    "price": 100,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
    "exp": 7,
    "barcode": "890200000030",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Pineapple (1 pc)",
    "price": 80,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400",
    "exp": 7,
    "barcode": "890200000031",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Pomegranate (500g)",
    "price": 120,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400",
    "exp": 10,
    "barcode": "890200000032",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Pear (1kg)",
    "price": 100,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=400",
    "exp": 10,
    "barcode": "890200000033",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Tomato (1kg)",
    "price": 40,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
    "exp": 7,
    "barcode": "890200000034",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Onion (1kg)",
    "price": 35,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1618512496248-a07ce8333967?w=400",
    "exp": 30,
    "barcode": "890200000035",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Potato (1kg)",
    "price": 30,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1518977676616-bc1cb3c68ea5?w=400",
    "exp": 30,
    "barcode": "890200000036",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Carrot (500g)",
    "price": 45,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
    "exp": 14,
    "barcode": "890200000037",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Beetroot (500g)",
    "price": 40,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1596197840773-7cf7c600a09e?w=400",
    "exp": 14,
    "barcode": "890200000038",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cucumber (500g)",
    "price": 30,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=400",
    "exp": 7,
    "barcode": "890200000039",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cabbage (1 pc)",
    "price": 30,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1594282419889-c0e8c0a1a2c5?w=400",
    "exp": 14,
    "barcode": "890200000040",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cauliflower (1 pc)",
    "price": 50,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400",
    "exp": 7,
    "barcode": "890200000041",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Broccoli (500g)",
    "price": 80,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400",
    "exp": 7,
    "barcode": "890200000042",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Spinach (bunch)",
    "price": 25,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1576045057995-c4c5201c1c3c?w=400",
    "exp": 5,
    "barcode": "890200000043",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Coriander Leaves (bunch)",
    "price": 15,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400",
    "exp": 5,
    "barcode": "890200000044",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Mint Leaves (bunch)",
    "price": 15,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400",
    "exp": 5,
    "barcode": "890200000045",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Green Chilli (100g)",
    "price": 20,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400",
    "exp": 7,
    "barcode": "890200000046",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Capsicum (500g)",
    "price": 70,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400",
    "exp": 10,
    "barcode": "890200000047",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Ginger (100g)",
    "price": 25,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400",
    "exp": 14,
    "barcode": "890200000048",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Garlic (100g)",
    "price": 30,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400",
    "exp": 30,
    "barcode": "890200000049",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Lady Finger (500g)",
    "price": 40,
    "category_id": 2,
    "category_name": "Fruits & Vegetables",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1601564923647-b7e95c6e7a5d?w=400",
    "exp": 5,
    "barcode": "890200000050",
    "hsn_code": "0702",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Full Cream Milk (1L)",
    "price": 68,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
    "exp": 5,
    "barcode": "890300000051",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Toned Milk (1L)",
    "price": 58,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    "exp": 5,
    "barcode": "890300000052",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Skimmed Milk (500ml)",
    "price": 35,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    "exp": 5,
    "barcode": "890300000053",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Plain Curd (400g)",
    "price": 40,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    "exp": 7,
    "barcode": "890300000054",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Fruit Curd (400g)",
    "price": 50,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    "exp": 7,
    "barcode": "890300000055",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Butter (200g)",
    "price": 85,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1589985270826-4b7bb8352b21?w=400",
    "exp": 60,
    "barcode": "890300000056",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Margarine (200g)",
    "price": 75,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1589985270826-4b7bb8352b21?w=400",
    "exp": 60,
    "barcode": "890300000057",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cheese Slices (10pc)",
    "price": 120,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1486297678152-eb5ebc50dbec?w=400",
    "exp": 90,
    "barcode": "890300000058",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cheese Block (200g)",
    "price": 180,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1486297678152-eb5ebc50dbec?w=400",
    "exp": 90,
    "barcode": "890300000059",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Paneer (200g)",
    "price": 90,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    "exp": 7,
    "barcode": "890300000060",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cream (200ml)",
    "price": 75,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400",
    "exp": 14,
    "barcode": "890300000061",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Whipped Cream (200ml)",
    "price": 120,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400",
    "exp": 14,
    "barcode": "890300000062",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Flavored Milk - Mango (180ml)",
    "price": 35,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    "exp": 30,
    "barcode": "890300000063",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Strawberry Milkshake (180ml)",
    "price": 40,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    "exp": 14,
    "barcode": "890300000064",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Chocolate Milkshake (180ml)",
    "price": 35,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
    "exp": 14,
    "barcode": "890300000065",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Ice Cream (500ml)",
    "price": 150,
    "category_id": 3,
    "category_name": "Dairy Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400",
    "exp": 90,
    "barcode": "890300000066",
    "hsn_code": "0401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cream Biscuits",
    "price": 25,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1499636136210-6f410bb60e52?w=400",
    "exp": 180,
    "barcode": "890400000067",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Glucose Biscuits",
    "price": 15,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1499636136210-6f410bb60e52?w=400",
    "exp": 180,
    "barcode": "890400000068",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Potato Chips (80g)",
    "price": 30,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607478958564-6f2c3c89ac3a?w=400",
    "exp": 90,
    "barcode": "890400000069",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Nachos (100g)",
    "price": 60,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400",
    "exp": 90,
    "barcode": "890400000070",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Instant Noodles",
    "price": 20,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
    "exp": 365,
    "barcode": "890400000071",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Instant Pasta (Pack)",
    "price": 55,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1621996311210-9856ad7937af?w=400",
    "exp": 365,
    "barcode": "890400000072",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Chocolate Bar",
    "price": 80,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400",
    "exp": 180,
    "barcode": "890400000073",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Dark Chocolate (100g)",
    "price": 160,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400",
    "exp": 365,
    "barcode": "890400000074",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Candies (Pack)",
    "price": 30,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400",
    "exp": 180,
    "barcode": "890400000075",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Popcorn (Pack)",
    "price": 40,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1611186871525-8a2ab51f4e9a?w=400",
    "exp": 90,
    "barcode": "890400000076",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Namkeen Mixture (200g)",
    "price": 55,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400",
    "exp": 120,
    "barcode": "890400000077",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Roasted Peanuts (200g)",
    "price": 60,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1572543999964-bf83f9aee0f8?w=400",
    "exp": 120,
    "barcode": "890400000078",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Ready-to-Eat Poha",
    "price": 45,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
    "exp": 180,
    "barcode": "890400000079",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Ready-to-Eat Upma",
    "price": 50,
    "category_id": 4,
    "category_name": "Snacks & Packaged Foods",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
    "exp": 180,
    "barcode": "890400000080",
    "hsn_code": "2106",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cola (500ml)",
    "price": 45,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
    "exp": 180,
    "barcode": "890500000081",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Lemon Soda (500ml)",
    "price": 40,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
    "exp": 180,
    "barcode": "890500000082",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Mango Juice (200ml)",
    "price": 20,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1613478223719-2ea11c1955fb?w=400",
    "exp": 90,
    "barcode": "890500000083",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Orange Juice (200ml)",
    "price": 25,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
    "exp": 90,
    "barcode": "890500000084",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Mixed Fruit Juice (200ml)",
    "price": 25,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
    "exp": 90,
    "barcode": "890500000085",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Lemon Juice (500ml)",
    "price": 80,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1548741487-18d363dc4469?w=400",
    "exp": 90,
    "barcode": "890500000086",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Energy Drink (250ml)",
    "price": 100,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400",
    "exp": 365,
    "barcode": "890500000087",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Green Tea (25 bags)",
    "price": 160,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400",
    "exp": 730,
    "barcode": "890500000088",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Black Tea Bags (25pc)",
    "price": 130,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400",
    "exp": 730,
    "barcode": "890500000089",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Instant Coffee (100g)",
    "price": 280,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400",
    "exp": 365,
    "barcode": "890500000090",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Filter Coffee Powder (200g)",
    "price": 200,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400",
    "exp": 180,
    "barcode": "890500000091",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Packaged Drinking Water (1L)",
    "price": 20,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1616118132534-381148898bb4?w=400",
    "exp": 365,
    "barcode": "890500000092",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Sparkling Water (500ml)",
    "price": 50,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1616118132534-381148898bb4?w=400",
    "exp": 365,
    "barcode": "890500000093",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Coconut Water (250ml)",
    "price": 45,
    "category_id": 5,
    "category_name": "Beverages",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1550697851-920b181d9ed3?w=400",
    "exp": 30,
    "barcode": "890500000094",
    "hsn_code": "2202",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Bath Soap (100g)",
    "price": 40,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400",
    "exp": 730,
    "barcode": "890600000095",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Shampoo (200ml)",
    "price": 180,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400",
    "exp": 730,
    "barcode": "890600000096",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Conditioner (200ml)",
    "price": 200,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400",
    "exp": 730,
    "barcode": "890600000097",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Toothpaste (150g)",
    "price": 95,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    "exp": 365,
    "barcode": "890600000098",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Toothbrush (Pack of 2)",
    "price": 80,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400",
    "exp": 730,
    "barcode": "890600000099",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Face Wash (100ml)",
    "price": 145,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
    "exp": 730,
    "barcode": "890600000100",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Face Cream (50ml)",
    "price": 280,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
    "exp": 730,
    "barcode": "890600000101",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Moisturizer (100ml)",
    "price": 250,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
    "exp": 730,
    "barcode": "890600000102",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Sunscreen SPF50 (50ml)",
    "price": 320,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
    "exp": 730,
    "barcode": "890600000103",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Hair Oil (200ml)",
    "price": 130,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=400",
    "exp": 730,
    "barcode": "890600000104",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Deodorant Body Spray",
    "price": 240,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=400",
    "exp": 730,
    "barcode": "890600000105",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Perfume (100ml)",
    "price": 850,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400",
    "exp": 1095,
    "barcode": "890600000106",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Lip Balm",
    "price": 120,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1586495777744-4e6232bf4c4f?w=400",
    "exp": 730,
    "barcode": "890600000107",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Razors (Pack of 4)",
    "price": 150,
    "category_id": 6,
    "category_name": "Personal Care",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400",
    "exp": 730,
    "barcode": "890600000108",
    "hsn_code": "3304",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Detergent Powder (1kg)",
    "price": 120,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400",
    "exp": 730,
    "barcode": "890700000109",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Liquid Detergent (1L)",
    "price": 200,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400",
    "exp": 730,
    "barcode": "890700000110",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Floor Cleaner (1L)",
    "price": 95,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400",
    "exp": 730,
    "barcode": "890700000111",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Toilet Cleaner (500ml)",
    "price": 80,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400",
    "exp": 730,
    "barcode": "890700000112",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Glass Cleaner (500ml)",
    "price": 120,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400",
    "exp": 730,
    "barcode": "890700000113",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Dishwash Liquid (500ml)",
    "price": 90,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400",
    "exp": 730,
    "barcode": "890700000114",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Dishwash Bar (Pack of 2)",
    "price": 60,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400",
    "exp": 730,
    "barcode": "890700000115",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Scrub Pad (Pack of 3)",
    "price": 45,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    "exp": 730,
    "barcode": "890700000116",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Broom",
    "price": 150,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    "exp": 730,
    "barcode": "890700000117",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Mop with Bucket",
    "price": 450,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400",
    "exp": 730,
    "barcode": "890700000118",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Garbage Bags (30pc)",
    "price": 75,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
    "exp": 730,
    "barcode": "890700000119",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Air Freshener (300ml)",
    "price": 180,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400",
    "exp": 365,
    "barcode": "890700000120",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Mosquito Repellent Liquid",
    "price": 250,
    "category_id": 7,
    "category_name": "Household & Cleaning",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400",
    "exp": 365,
    "barcode": "890700000121",
    "hsn_code": "3401",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "White Bread (400g)",
    "price": 45,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    "exp": 7,
    "barcode": "890800000122",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Brown Bread (400g)",
    "price": 55,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    "exp": 7,
    "barcode": "890800000123",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Multigrain Bread (400g)",
    "price": 65,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    "exp": 7,
    "barcode": "890800000124",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Chocolate Cake (Slice)",
    "price": 90,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    "exp": 3,
    "barcode": "890800000125",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Vanilla Cake (Slice)",
    "price": 80,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400",
    "exp": 3,
    "barcode": "890800000126",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Fruit Cake (250g)",
    "price": 150,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    "exp": 14,
    "barcode": "890800000127",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Bun (Pack of 4)",
    "price": 40,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400",
    "exp": 5,
    "barcode": "890800000128",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Dinner Rolls (6pc)",
    "price": 60,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400",
    "exp": 5,
    "barcode": "890800000129",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Garlic Bread (Pack)",
    "price": 80,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1619535860434-cf9b902c99af?w=400",
    "exp": 5,
    "barcode": "890800000130",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cookies (Pack of 10)",
    "price": 60,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1499636136210-6f410bb60e52?w=400",
    "exp": 30,
    "barcode": "890800000131",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Muffin (Blueberry)",
    "price": 60,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400",
    "exp": 5,
    "barcode": "890800000132",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Pastry",
    "price": 75,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400",
    "exp": 3,
    "barcode": "890800000133",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Croissant",
    "price": 50,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1555507036-ab1f40ce88ca?w=400",
    "exp": 3,
    "barcode": "890800000134",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Pizza Base (Pack of 2)",
    "price": 80,
    "category_id": 8,
    "category_name": "Bakery & Bread",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400",
    "exp": 30,
    "barcode": "890800000135",
    "hsn_code": "1905",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Baby Cerelac - Stage 1 (400g)",
    "price": 250,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607007998655-01e8ca87e4a6?w=400",
    "exp": 365,
    "barcode": "890900000136",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Formula Milk (400g)",
    "price": 650,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607007998655-01e8ca87e4a6?w=400",
    "exp": 365,
    "barcode": "890900000137",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Diapers (Pack of 20)",
    "price": 499,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1566765729459-ece645dec1d7?w=400",
    "exp": 730,
    "barcode": "890900000138",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Baby Wipes (72pc)",
    "price": 180,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1566765729459-ece645dec1d7?w=400",
    "exp": 730,
    "barcode": "890900000139",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Baby Lotion (200ml)",
    "price": 220,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607007998655-01e8ca87e4a6?w=400",
    "exp": 730,
    "barcode": "890900000140",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Baby Shampoo (200ml)",
    "price": 200,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607007998655-01e8ca87e4a6?w=400",
    "exp": 730,
    "barcode": "890900000141",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Baby Soap (75g)",
    "price": 80,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607007998655-01e8ca87e4a6?w=400",
    "exp": 730,
    "barcode": "890900000142",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Baby Oil (200ml)",
    "price": 150,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607007998655-01e8ca87e4a6?w=400",
    "exp": 730,
    "barcode": "890900000143",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Baby Rash Cream (50g)",
    "price": 175,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607007998655-01e8ca87e4a6?w=400",
    "exp": 730,
    "barcode": "890900000144",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Baby Powder (100g)",
    "price": 120,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1607007998655-01e8ca87e4a6?w=400",
    "exp": 730,
    "barcode": "890900000145",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Feeding Bottle (250ml)",
    "price": 350,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400",
    "exp": 730,
    "barcode": "890900000146",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Teether Toy",
    "price": 200,
    "category_id": 9,
    "category_name": "Baby & Kids Products",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400",
    "exp": 730,
    "barcode": "890900000147",
    "hsn_code": "9619",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Multivitamin Tablets (30pc)",
    "price": 499,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    "exp": 730,
    "barcode": "891000000148",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Vitamin C Tablets (30pc)",
    "price": 250,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    "exp": 730,
    "barcode": "891000000149",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Antiseptic Liquid (100ml)",
    "price": 95,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1576671414121-aa2d60f2a853?w=400",
    "exp": 730,
    "barcode": "891000000150",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Bandages (Pack of 10)",
    "price": 55,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1576671414121-aa2d60f2a853?w=400",
    "exp": 730,
    "barcode": "891000000151",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cotton Balls (100pc)",
    "price": 60,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1576671414121-aa2d60f2a853?w=400",
    "exp": 730,
    "barcode": "891000000152",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Elastic Bandage (2pc)",
    "price": 80,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1576671414121-aa2d60f2a853?w=400",
    "exp": 730,
    "barcode": "891000000153",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Pain Relief Tablets",
    "price": 85,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    "exp": 730,
    "barcode": "891000000154",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Antacid Tablets (10pc)",
    "price": 30,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    "exp": 365,
    "barcode": "891000000155",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Cough Syrup (100ml)",
    "price": 120,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1576671414121-aa2d60f2a853?w=400",
    "exp": 365,
    "barcode": "891000000156",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Glucose Powder (200g)",
    "price": 90,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    "exp": 365,
    "barcode": "891000000157",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Sanitary Napkins (Pack of 8)",
    "price": 60,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    "exp": 730,
    "barcode": "891000000158",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Hand Sanitizer (100ml)",
    "price": 75,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400",
    "exp": 365,
    "barcode": "891000000159",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Face Masks (Pack of 10)",
    "price": 120,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    "exp": 365,
    "barcode": "891000000160",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Digital Thermometer",
    "price": 350,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1576671414121-aa2d60f2a853?w=400",
    "exp": 1095,
    "barcode": "891000000161",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  },
  {
    "name": "Blood Pressure Monitor",
    "price": 2500,
    "category_id": 10,
    "category_name": "Health & Wellness",
    "supplier_id": 5,
    "supplier_name": "FreshFarms Agro",
    "img": "https://images.unsplash.com/photo-1576671414121-aa2d60f2a853?w=400",
    "exp": 1095,
    "barcode": "891000000162",
    "hsn_code": "3004",
    "stock_in": 100,
    "stock_out": 10
  }
];

const categories = [
  { category_id: 1, category_name: 'Grocery & Staples', description: 'Essential cooking items including rice, flour, pulses, and basic pantry needs.' },
  { category_id: 2, category_name: 'Fruits & Vegetables', description: 'Fresh produce including seasonal vegetables and a variety of fruits.' },
  { category_id: 3, category_name: 'Dairy Products', description: 'Milk, cheese, butter, yogurt, and farm-fresh eggs.' },
  { category_id: 4, category_name: 'Snacks & Packaged Foods', description: 'Packaged snacks, chocolates, biscuits, and ready-to-eat meals.' },
  { category_id: 5, category_name: 'Beverages', description: 'Coffee, tea, juices, soft drinks, and energy beverages.' },
  { category_id: 6, category_name: 'Personal Care', description: 'Soaps, shampoos, skincare, and hygiene products.' },
  { category_id: 7, category_name: 'Household & Cleaning', description: 'Detergents, floor cleaners, and essential home maintenance items.' },
  { category_id: 8, category_name: 'Bakery & Bread', description: 'Freshly baked breads, pastries, and cakes.' },
  { category_id: 9, category_name: 'Baby & Kids Products', description: 'Diapers, baby food, and gentle care products for children.' },
  { category_id: 10, category_name: 'Health & Wellness', description: 'Vitamins, supplements, and OTC health care essentials.' }
];

const hsnCodes = [
  { hsn_code: '0401', gst_rate: 5.00 },
  { hsn_code: '0702', gst_rate: 0.00 },
  { hsn_code: '1006', gst_rate: 0.00 },
  { hsn_code: '1101', gst_rate: 0.00 },
  { hsn_code: '1905', gst_rate: 12.00 },
  { hsn_code: '2106', gst_rate: 18.00 },
  { hsn_code: '2202', gst_rate: 12.00 },
  { hsn_code: '3004', gst_rate: 12.00 },
  { hsn_code: '3005', gst_rate: 12.00 },
  { hsn_code: '3304', gst_rate: 18.00 },
  { hsn_code: '3401', gst_rate: 18.00 },
  { hsn_code: '9619', gst_rate: 12.00 }
];

const warehouseAddresses = [
  { pincode: '560001', city: 'Bangalore', state: 'Karnataka' },
  { pincode: '400001', city: 'Mumbai', state: 'Maharashtra' },
  { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu' },
  { pincode: '700001', city: 'Kolkata', state: 'West Bengal' },
  { pincode: '110001', city: 'New Delhi', state: 'Delhi' }
];

const warehouses = [
  { warehouse_id: 1, warehouse_manager: 'Rajesh Kumar', pincode: '560001' },
  { warehouse_id: 2, warehouse_manager: 'Suresh Raina', pincode: '400001' },
  { warehouse_id: 3, warehouse_manager: 'Amit Shah', pincode: '600001' },
  { warehouse_id: 4, warehouse_manager: 'Mamata Di', pincode: '700001' },
  { warehouse_id: 5, warehouse_manager: 'Arvind K', pincode: '110001' }
];

const SUPPLIER_RAW_PASSWORD = 'supplier123';

async function buildSuppliers() {
  const hash = await bcrypt.hash(SUPPLIER_RAW_PASSWORD, 10);
  return [
    { supplier_id: 1, supplier_name: 'Laxmi Grocery',        email: 'supplier1@logistics.com',  password: hash, pincode: '600001', bank_account_number: 'SBI001234567890' },
    { supplier_id: 5, supplier_name: 'FreshFarms Agro',      email: 'freshfarms@supply.com',    password: hash, pincode: '400001', bank_account_number: 'HDFC009876543210' },
    { supplier_id: 6, supplier_name: 'NutriPack Industries', email: 'nutripack@supply.com',     password: hash, pincode: '560001', bank_account_number: 'ICICI001122334455' },
    { supplier_id: 7, supplier_name: 'CleanCo Distributors', email: 'cleanco@supply.com',       password: hash, pincode: '110001', bank_account_number: 'AXIS006677889900' },
  ];
}

async function run() {
  console.log('Starting DB seeding...');

  // Pre-compute bcrypt hash BEFORE opening a DB connection/transaction
  const suppliers = await buildSuppliers();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tablesToClear = [
      'purchase_order_detail', 'purchase_order',
      'sales_transaction_details', 'payment', 'stock_adjustment', 
      'sales_transaction', 'inventory', 'product_reorder', 'Product_Description',
      'product', 'hsn_tax', 'category', 'warehouse', 'warehouse_address',
      'supplier_contact', 'supplier_address', 'supplier_bank_details', 'supplier'
    ];

    const tablesToReset = [
      'sales_transaction', 'payment', 'inventory', 'Product_Description', 'product', 'category', 'warehouse', 'supplier'
    ];

    for (const table of tablesToClear) {
      await conn.query('DELETE FROM `'+table+'`');
      console.log('Cleared ' + table);
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const cat of categories) {
      await conn.query('INSERT INTO category (category_id, category_name, description) VALUES (?, ?, ?)', 
        [cat.category_id, cat.category_name, cat.description]);
    }
    console.log('Categories seeded.');

    for (const hsn of hsnCodes) {
      await conn.query('INSERT INTO hsn_tax (hsn_code, gst_rate) VALUES (?, ?)', 
        [hsn.hsn_code, hsn.gst_rate]);
    }
    console.log('HSN Taxes seeded.');

    // Seed Purchase Order Statuses
    const basePoStatuses = [
      { status: 'Pending', payment_status: 'Unpaid' },
      { status: 'In Progress', payment_status: 'Unpaid' },
      { status: 'Shipped', payment_status: 'Unpaid' },
      { status: 'Delivered', payment_status: 'Paid' }
    ];
    for (const st of basePoStatuses) {
      await conn.query('INSERT IGNORE INTO purchase_order_status (status, payment_status) VALUES (?, ?)', [st.status, st.payment_status]);
    }

    // Seed Sales Txn Fees
    const paymentMethods = [
      { id: 'Cash', fee: 0.00 },
      { id: 'UPI', fee: 0.00 },
      { id: 'Debit Card', fee: 1.00 },
      { id: 'Credit Card', fee: 2.50 },
      { id: 'Net Banking', fee: 1.50 }
    ];
    for (const pt of paymentMethods) {
      await conn.query('INSERT IGNORE INTO sales_transaction_fees (payment_type_id, payment_processing_fee) VALUES (?, ?)', [pt.id, pt.fee]);
    }

    // Seed Sales Txn Rates
    await conn.query('INSERT IGNORE INTO sales_transaction_rates (tax_category, tax_rate) VALUES (?, ?)', ['GST_12', 12.00]);
    await conn.query('INSERT IGNORE INTO sales_transaction_rates (tax_category, tax_rate) VALUES (?, ?)', ['GST_18', 18.00]);
    await conn.query('INSERT IGNORE INTO sales_transaction_rates (tax_category, tax_rate) VALUES (?, ?)', ['GST_5', 5.00]);
    await conn.query('INSERT IGNORE INTO sales_transaction_rates (tax_category, tax_rate) VALUES (?, ?)', ['GST_0', 0.00]);

    for (const addr of warehouseAddresses) {
      await conn.query('INSERT INTO warehouse_address (pincode, city, state) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE city=VALUES(city)', 
        [addr.pincode, addr.city, addr.state]);
    }
    for (const wh of warehouses) {
      await conn.query('INSERT INTO warehouse (warehouse_id, warehouse_manager, pincode) VALUES (?, ?, ?)', 
        [wh.warehouse_id, wh.warehouse_manager, wh.pincode]);
    }
    console.log('Warehouses seeded.');

    const suppliers = await buildSuppliers();

    // Step 1: Insert suppliers WITHOUT FK fields to avoid constraint order issues
    for (const sup of suppliers) {
      await conn.query(
        'INSERT INTO supplier (supplier_id, supplier_name, email, password) VALUES (?, ?, ?, ?)',
        [sup.supplier_id, sup.supplier_name, sup.email, sup.password]
      );
    }
    console.log('Suppliers inserted (base data).');

    // Step 2: Seed supplier_bank_details
    const bankDetails = [
      { bank_account_number: 'SBI001234567890',    ifsc_code: 'SBIN0001234', branch_name: 'Chennai Main',    bank_name: 'State Bank of India' },
      { bank_account_number: 'HDFC009876543210',   ifsc_code: 'HDFC0009876', branch_name: 'Mumbai Central',  bank_name: 'HDFC Bank' },
      { bank_account_number: 'ICICI001122334455',  ifsc_code: 'ICIC0001122', branch_name: 'Bangalore North', bank_name: 'ICICI Bank' },
      { bank_account_number: 'AXIS006677889900',   ifsc_code: 'UTIB0006677', branch_name: 'Delhi Connaught', bank_name: 'Axis Bank' },
    ];
    for (const b of bankDetails) {
      await conn.query(
        'INSERT INTO supplier_bank_details (bank_account_number, ifsc_code, branch_name, bank_name) VALUES (?, ?, ?, ?)',
        [b.bank_account_number, b.ifsc_code, b.branch_name, b.bank_name]
      );
    }
    console.log('Supplier bank details seeded.');

    // Step 3: Seed supplier_address
    const supplierAddresses = [
      { pincode: '600001', city: 'Chennai',   state: 'Tamil Nadu' },
      { pincode: '400001', city: 'Mumbai',    state: 'Maharashtra' },
      { pincode: '560001', city: 'Bangalore', state: 'Karnataka' },
      { pincode: '110001', city: 'New Delhi', state: 'Delhi' },
    ];
    for (const a of supplierAddresses) {
      await conn.query(
        'INSERT INTO supplier_address (pincode, city, state) VALUES (?, ?, ?)',
        [a.pincode, a.city, a.state]
      );
    }
    console.log('Supplier addresses seeded.');

    // Step 4: UPDATE suppliers with FK fields now that dependencies exist
    for (const sup of suppliers) {
      await conn.query(
        'UPDATE supplier SET pincode = ?, bank_account_number = ? WHERE supplier_id = ?',
        [sup.pincode, sup.bank_account_number, sup.supplier_id]
      );
    }
    console.log('Suppliers updated with pincode and bank account.');

    let prodCount = 0;
    let nextProductId = 1;
    let nextInventoryId = 1;
    for (const p of allProducts) {
      // Dynamically assign supplier based on category
      let assignedSupplierId = 5; // Default: FreshFarms Agro
      const catId = p.category_id;
      
      if ([1].includes(catId)) assignedSupplierId = 1; // Grocery & Staples -> Laxmi
      else if ([2, 3, 8].includes(catId)) assignedSupplierId = 5; // Fresh/Dairy -> FreshFarms
      else if ([4, 5, 10, 9].includes(catId)) assignedSupplierId = 6; // Snacks/Beverages -> NutriPack
      else if ([6, 7].includes(catId)) assignedSupplierId = 7; // Personal/Household -> CleanCo

      const productId = nextProductId++;
      await conn.query(
        'INSERT INTO product (product_id, product_name, unit_price, category_id, supplier_id, image_url, barcode, hsn_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [productId, p.name, p.price, p.category_id, assignedSupplierId, p.img, p.barcode || null, p.hsn_code]
      );

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (p.exp || 365));

      const stockIn = p.stock_in || 100;
      const stockOut = p.stock_out || 0;
      const currentStock = stockIn - stockOut;
      const warehouseId = Math.floor(Math.random() * 5) + 1;

      const inventoryId = nextInventoryId++;
      await conn.query(
        'INSERT INTO inventory (inventory_id, product_id, stock_in, stock_out, current_stock, expiry_date, warehouse_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [inventoryId, productId, stockIn, stockOut, currentStock, expiryDate, warehouseId]
      );

      await conn.query(
        'INSERT INTO product_reorder (product_id, warehouse_id, reorder_level) VALUES (?, ?, ?)',
        [productId, warehouseId, 10]
      );

      const productDesc = p.description || `Premium quality ${p.name}. Perfect for your daily needs and ensuring the best standards in its category (${p.category_name}).`;
      await conn.query(
        'INSERT INTO Product_Description (product_id, product_description) VALUES (?, ?)',
        [productId, productDesc]
      );

      prodCount++;
      if (prodCount % 50 === 0) console.log('Seeded ' + prodCount + ' products...');
    }
    console.log('Total ' + prodCount + ' products seeded.');

    // ─── Seed Purchase Orders & Details ───────────────────────────────────────
    console.log('Seeding purchase orders...');
    const [dbProds] = await conn.query('SELECT product_id, unit_price, supplier_id FROM product');
    
    // Group products by supplier
    const prodsBySupplier = {};
    for (const p of dbProds) {
      if (!prodsBySupplier[p.supplier_id]) prodsBySupplier[p.supplier_id] = [];
      prodsBySupplier[p.supplier_id].push(p);
    }

    const poStatuses = ['Pending', 'Shipped', 'Delivered', 'In Progress'];
    const suppliersForPO = [1, 5, 6, 7];
    let poCount = 0;
    let nextPoId = 1;

    for (const supplierId of suppliersForPO) {
      const supProds = prodsBySupplier[supplierId] || [];
      if (supProds.length === 0) continue;

      // Create 2-3 POs per supplier
      const numOrders = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numOrders; i++) {
        const status = poStatuses[Math.floor(Math.random() * poStatuses.length)];
        const orderDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        const deliveryDate = status !== 'Pending' ? new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

        // Pick 3-5 random products for this PO
        const numItems = 3 + Math.floor(Math.random() * 3);
        const selectedProds = supProds.sort(() => Math.random() - 0.5).slice(0, Math.min(numItems, supProds.length));
        const qty = 50 + Math.floor(Math.random() * 51); // 50-100 units
        const totalAmount = selectedProds.reduce((sum, p) => sum + parseFloat(p.unit_price) * qty, 0);

        const poId = nextPoId++;
        await conn.query(
          'INSERT INTO purchase_order (po_id, supplier_id, order_date, total_amount, status, delivery_date) VALUES (?, ?, ?, ?, ?, ?)',
          [poId, supplierId, orderDate, totalAmount.toFixed(2), status, deliveryDate]
        );

        for (let j = 0; j < selectedProds.length; j++) {
          const batchNo = `BATCH-${poId}-${String(j + 1).padStart(2, '0')}`;
          await conn.query(
            'INSERT INTO purchase_order_detail (po_id, product_id, quantity_ordered, batch_no) VALUES (?, ?, ?, ?)',
            [poId, selectedProds[j].product_id, qty, batchNo]
          );
        }
        poCount++;
      }
    }
    console.log('Seeded ' + poCount + ' purchase orders with details.');
    // ──────────────────────────────────────────────────────────────────────────

    console.log('Seeding 20 mock sales...');
    const [allProds] = await conn.query('SELECT product_id, unit_price FROM product');
    
    let nextTxnId = 1;
    let nextPaymentId = 1;

    const pTypes = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Net Banking'];
    for (let i = 0; i < 20; i++) {
        const transactionDate = new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000);
        const paymentType = pTypes[Math.floor(Math.random() * pTypes.length)];
        
        const transactionId = nextTxnId++;
        await conn.query(
          'INSERT INTO sales_transaction (transaction_id, employee_id, transaction_date, total_items, grand_total, payment_type_id) VALUES (?, ?, ?, ?, ?, ?)',
          [transactionId, null, transactionDate, 0, 0, paymentType]
        );
  
        let totalItems = 0;
        let grandTotal = 0;
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedIndices = new Set();
  
        for (let j = 0; j < numItems; j++) {
          let idx = Math.floor(Math.random() * allProds.length);
          while (selectedIndices.has(idx)) idx = Math.floor(Math.random() * allProds.length);
          selectedIndices.add(idx);
  
          const p = allProds[idx];
          const qty = Math.floor(Math.random() * 3) + 1;
          const price = parseFloat(p.unit_price);
          const sub = price * qty;
          const tax = sub * 0.12;
          const lineTotal = sub + tax;
  
          grandTotal += lineTotal;
          totalItems += qty;
  
          await conn.query(
            'INSERT INTO sales_transaction_details (transaction_id, product_id, quantity_sold, unit_price, tax, line_total, tax_category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [transactionId, p.product_id, qty, price, tax, lineTotal, 'GST_12']
          );
        }
  
        await conn.query(
          'UPDATE sales_transaction SET total_items = ?, grand_total = ? WHERE transaction_id = ?',
          [totalItems, grandTotal, transactionId]
        );
  
        const paymentId = nextPaymentId++;
        await conn.query(
          'INSERT INTO payment (payment_id, transaction_id, payment_method, amount_paid, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?)',
          [paymentId, transactionId, paymentType, grandTotal, 'Completed', transactionDate]
        );
    }
    console.log('20 Mock sales seeded.');

    await conn.commit();
    console.log('Seeding finished successfully.');
  } catch (err) {
    await conn.rollback();
    console.error('Seeding failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

run();
