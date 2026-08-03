import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));



// Database configuration targeting 14.225.250.17
const getDbConfig = () => ({
  host: process.env.DB_HOSTNAME || '14.225.250.17',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'upos',
  password: process.env.DB_PASSWORD || '67bDuyyve4@#*rawvYpNOJaW',
  database: 'image_ocr',
  connectTimeout: 4000,
});

// Dynamic connection pool map for requested databases
let poolMap: Map<string, mysql.Pool> = new Map();

function getPoolForDb(dbName: string = 'image_ocr') {
  const targetDb = dbName || 'image_ocr';
  if (!poolMap.has(targetDb)) {
    const config = getDbConfig();
    const p = mysql.createPool({
      ...config,
      database: targetDb,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    poolMap.set(targetDb, p);
  }
  return poolMap.get(targetDb)!;
}

// Fallback Benchmark Records if MySQL Connection is unreachable/timed out
const FALLBACK_DEMO_RECORDS = [
  {
    id: 85,
    image_id: 39,
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
    name: 'Nguyễn Thùy Trang',
    phone: '0886900872',
    address: 'BÀI LÃI, TAM TIẾN, BẮC NINH',
    products: 'Shop Duyên Duyên',
    model_used: 'ChatGPT GPT 5.4 Nano',
    document_type: 'ChatGPT GPT 5.4 Nano',
    accuracy: 53.8,
    confidence_score: 53.8,
    execution_time: 12.12,
    ocr_text: 'Số điện thoại: 033.2299.456\n\nNgười nhận: ...Thúy ... Hằng\nĐịa chỉ: Bái Lâu - ...tân... ...Bắc Ninh\nĐiện thoại: 0886.960.872',
    raw_text: 'Số điện thoại: 033.2299.456\n\nNgười nhận: ...Thúy ... Hằng\nĐịa chỉ: Bái Lâu - ...tân... ...Bắc Ninh\nĐiện thoại: 0886.960.872',
    ground_truth: 'SHOP DUYÊN DUYÊN.\nĐỊA CHỈ: THÔN TÌNH LAM - XÃ ĐẠI THÀNH - HUYỆN QUỐC OAI - TP. HÀ NỘI.\nĐIỆN THOẠI: 033.2299.456\nNGƯỜI NHẬN: Nguyễn Thùy Trang.\nĐỊA CHỈ: BÀI LÃI, TAM TIẾN, BẮC NINH.\nĐIỆN THOẠI: 0886.900.872',
    token_usage: '120 tokens',
    extracted_json: '{"name":"Thúy Hằng","phone":"0886960872","address":"Bái Lâu, Bắc Ninh"}',
    file_name: 'image_39.jpg',
    status: 'SUCCESS',
    created_at: new Date().toISOString()
  },
  {
    id: 84,
    image_id: 39,
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
    name: 'Ngô Thúy Trang',
    phone: '0886900872',
    address: 'BÀI LÃI, TAM TIẾN, BẮC NINH',
    products: '1 XL, 2 M',
    model_used: 'Gemini 3.1 Flash-Lite',
    document_type: 'Gemini 3.1 Flash-Lite',
    accuracy: 80.7,
    confidence_score: 80.7,
    execution_time: 2.15,
    ocr_text: 'LỜI GỬI: SHOP DUYÊN DUYÊN. ĐỊA CHỈ: THÔN TÌNH LAM - XÃ ĐẠI THÀNH - HUYỆN QUỐC OAI - TP. HÀ NỘI. ĐIỆN THOẠI: 033.2299.456. 1 XL, 2 M. SỐ TIỀN THU HỘ: . NGƯỜI NHẬN: NGÔ THÚY TRANG. ĐỊA CHỈ: BÀI LÃI, TAM TIẾN, BẮC NINH. ĐIỆN THOẠI: 0886.905.872. KHÔNG XEM HÀNG, VUI LÒNG LIÊN HỆ SHOP!',
    raw_text: 'LỜI GỬI: SHOP DUYÊN DUYÊN. ĐỊA CHỈ: THÔN TÌNH LAM - XÃ ĐẠI THÀNH - HUYỆN QUỐC OAI - TP. HÀ NỘI. ĐIỆN THOẠI: 033.2299.456. 1 XL, 2 M. SỐ TIỀN THU HỘ: . NGƯỜI NHẬN: NGÔ THÚY TRANG. ĐỊA CHỈ: BÀI LÃI, TAM TIẾN, BẮC NINH. ĐIỆN THOẠI: 0886.905.872. KHÔNG XEM HÀNG, VUI LÒNG LIÊN HỆ SHOP!',
    ground_truth: 'SHOP DUYÊN DUYÊN.\nĐỊA CHỈ: THÔN TÌNH LAM - XÃ ĐẠI THÀNH - HUYỆN QUỐC OAI - TP. HÀ NỘI.\nĐIỆN THOẠI: 033.2299.456\nNGƯỜI NHẬN: Nguyễn Thùy Trang.\nĐỊA CHỈ: BÀI LÃI, TAM TIẾN, BẮC NINH.\nĐIỆN THOẠI: 0886.900.872',
    token_usage: '95 tokens',
    extracted_json: '{"name":"NGÔ THÚY TRANG","phone":"0886905872","address":"BÀI LÃI, TAM TIẾN, BẮC NINH"}',
    file_name: 'image_39.jpg',
    status: 'SUCCESS',
    created_at: new Date().toISOString()
  },
  {
    id: 83,
    image_id: 39,
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
    name: 'Nguyễn Thùy Trang',
    phone: '0886900872',
    address: 'BÀI LÃI, TAM TIẾN, BẮC NINH',
    products: '1 XL, 2 M',
    model_used: 'vintern_python',
    document_type: 'vintern_python',
    accuracy: 94.2,
    confidence_score: 94.2,
    execution_time: 4.80,
    ocr_text: 'SHOP DUYÊN DUYÊN. ĐỊA CHỈ: THÔN TÌNH LAM - XÃ ĐẠI THÀNH - HUYỆN QUỐC OAI - TP. HÀ NỘI. ĐIỆN THOẠI: 033.2299.456. NGƯỜI NHẬN: Nguyễn Thùy Trang. ĐỊA CHỈ: BÀI LÃI, TAM TIẾN, BẮC NINH. ĐIỆN THOẠI: 0886.900.872',
    raw_text: 'SHOP DUYÊN DUYÊN. ĐỊA CHỈ: THÔN TÌNH LAM - XÃ ĐẠI THÀNH - HUYỆN QUỐC OAI - TP. HÀ NỘI. ĐIỆN THOẠI: 033.2299.456. NGƯỜI NHẬN: Nguyễn Thùy Trang. ĐỊA CHỈ: BÀI LÃI, TAM TIẾN, BẮC NINH. ĐIỆN THOẠI: 0886.900.872',
    ground_truth: 'SHOP DUYÊN DUYÊN.\nĐỊA CHỈ: THÔN TÌNH LAM - XÃ ĐẠI THÀNH - HUYỆN QUỐC OAI - TP. HÀ NỘI.\nĐIỆN THOẠI: 033.2299.456\nNGƯỜI NHẬN: Nguyễn Thùy Trang.\nĐỊA CHỈ: BÀI LÃI, TAM TIẾN, BẮC NINH.\nĐIỆN THOẠI: 0886.900.872',
    token_usage: '110 tokens',
    extracted_json: '{"name":"Nguyễn Thùy Trang","phone":"0886900872","address":"BÀI LÃI, TAM TIẾN, BẮC NINH"}',
    file_name: 'image_39.jpg',
    status: 'SUCCESS',
    created_at: new Date().toISOString()
  }
];

// Check Database Connection Status
app.get('/api/db-status', async (req, res) => {
  const config = getDbConfig();
  const startTime = Date.now();
  const requestedDb = (req.query.db as string) || 'image_ocr';

  try {
    const pool = getPoolForDb(requestedDb);
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT 1 as connected, DATABASE() as current_db');
    const pingTime = Date.now() - startTime;

    const [tables] = await pool.query<mysql.RowDataPacket[]>('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0] as string);

    let totalRows = 0;
    if (tableList.includes('ocr_results')) {
      const [countResult] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as total FROM ocr_results');
      totalRows = countResult[0]?.total || 0;
    }

    res.json({
      connected: true,
      host: config.host,
      port: config.port,
      user: config.user,
      database: requestedDb,
      pingTimeMs: pingTime,
      tables: tableList,
      totalRows,
      hasImageOcrTable: tableList.includes('ocr_results'),
      isDemoMode: false,
      message: `Kết nối thành công tới CSDL ${requestedDb} trên máy chủ 14.225.250.17`
    });
  } catch (err: any) {
    console.error('MySQL Connection error:', err.message);
    res.json({
      connected: false,
      host: config.host,
      port: config.port,
      user: config.user,
      database: requestedDb,
      error: err.message,
      isDemoMode: true,
      message: `Không thể kết nối trực tiếp MySQL 14.225.250.17 từ Vercel (${err.message}) - Đã tự động kích hoạt Demo Mode.`
    });
  }
});

// Get available databases on the MySQL server
app.get('/api/databases', async (req, res) => {
  try {
    const pool = getPoolForDb('image_ocr');
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SHOW DATABASES');
    const dbList = rows.map(r => r.Database as string).filter(db => !['information_schema', 'performance_schema', 'sys', 'mysql'].includes(db));
    res.json({ success: true, databases: dbList });
  } catch (err: any) {
    res.json({ success: true, databases: ['image_ocr', 'upos'], error: err.message });
  }
});

// Get available tables for a database
app.get('/api/tables', async (req, res) => {
  const dbName = (req.query.db as string) || 'image_ocr';
  try {
    const pool = getPoolForDb(dbName);
    const [tables] = await pool.query<mysql.RowDataPacket[]>('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0] as string);
    res.json({ success: true, database: dbName, tables: tableList });
  } catch (err: any) {
    res.json({ success: true, database: dbName, tables: ['ocr_results', 'images'], error: err.message });
  }
});

// Dedicated Image Endpoint (Lazy-loaded with HTTP Caching)
app.get('/api/image/:id', async (req, res) => {
  const imageId = req.params.id;
  const dbName = (req.query.db as string) || 'image_ocr';

  if (!imageId || imageId === 'null' || imageId === 'undefined') {
    return res.status(404).send('Image ID required');
  }

  try {
    const pool = getPoolForDb(dbName);
    let rows: mysql.RowDataPacket[] = [];

    try {
      const [res1] = await pool.query<mysql.RowDataPacket[]>(
        'SELECT image_base64, file_name FROM ocr_results WHERE image_id = ? OR id = ? LIMIT 1',
        [imageId, imageId]
      );
      rows = res1;
    } catch {
      const [res2] = await pool.query<mysql.RowDataPacket[]>(
        'SELECT image_base64 FROM images WHERE id = ? LIMIT 1',
        [imageId]
      );
      rows = res2;
    }

    if (rows.length > 0 && rows[0].image_base64) {
      let base64Data = rows[0].image_base64;
      let contentType = 'image/jpeg';

      if (base64Data.startsWith('data:')) {
        const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+);base64,(.*)$/);
        if (matches) {
          contentType = matches[1];
          base64Data = matches[2];
        }
      }

      const imgBuffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      return res.send(imgBuffer);
    }

    return res.redirect('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60');
  } catch (err: any) {
    return res.redirect('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60');
  }
});

// Main API: Query OCR Results Data with Filtering & Pagination
app.get('/api/ocr-data', async (req, res) => {
  const dbName = (req.query.db as string) || 'image_ocr';
  const tableName = (req.query.tableName as string) || 'ocr_results';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 70));
  const isDemo = req.query.demo === 'true';

  if (isDemo) {
    return res.json({
      success: true,
      databaseName: dbName,
      tableName: 'ocr_results',
      columns: [],
      data: FALLBACK_DEMO_RECORDS,
      pagination: { page: 1, limit, total: FALLBACK_DEMO_RECORDS.length, totalPages: 1 },
      availableTables: ['ocr_results', 'images'],
      isDemoMode: true,
      source: 'FALLBACK_DEMO'
    });
  }

  try {
    const pool = getPoolForDb(dbName);
    let whereClause = '';
    const queryParams: any[] = [];

    const total = FALLBACK_DEMO_RECORDS.length;
    const offset = (page - 1) * limit;

    const selectSql = `
      SELECT o.* 
      FROM ocr_results o 
      ${whereClause} 
      ORDER BY o.model_used ASC, o.id DESC 
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      selectSql,
      [...queryParams, limit, offset]
    );

    const columns = [
      { field: 'id', type: 'int(11)', key: 'PRI', null: 'NO' },
      { field: 'model_used', type: 'varchar(100)', key: '', null: 'YES' },
      { field: 'name', type: 'text', key: '', null: 'YES' },
      { field: 'phone', type: 'varchar(255)', key: '', null: 'YES' },
      { field: 'address', type: 'text', key: '', null: 'YES' },
      { field: 'products', type: 'text', key: '', null: 'YES' },
      { field: 'accuracy', type: 'float', key: '', null: 'YES' },
      { field: 'execution_time', type: 'float', key: '', null: 'YES' },
      { field: 'raw_text', type: 'text', key: '', null: 'YES' },
      { field: 'token_usage', type: 'text', key: '', null: 'YES' },
      { field: 'created_at', type: 'timestamp', key: '', null: 'NO' },
    ];

    const formattedData = rows.map(r => {
      const imgId = r.image_id || r.id;
      const imageUrl = imgId ? `/api/image/${imgId}?db=${dbName}` : null;

      return {
        id: r.id,
        image_id: r.image_id,
        image_url: imageUrl,
        image_base64: null,
        name: r.name || '',
        phone: r.phone || '',
        address: r.address || '',
        products: r.products || '',
        model_used: r.model_used || 'General OCR',
        document_type: r.model_used || 'Nhãn Vận Đơn OCR',
        accuracy: r.accuracy !== null ? Number(r.accuracy) : null,
        confidence_score: r.accuracy !== null ? Number(r.accuracy) : 80.0,
        execution_time: r.execution_time !== null ? Number(r.execution_time) : null,
        ocr_text: r.raw_text || '',
        raw_text: r.raw_text || '',
        ground_truth: r.ground_truth || '',
        token_usage: r.token_usage || '',
        extracted_json: r.json_result || '',
        json_result: r.json_result || '',
        file_name: `image_${r.image_id || r.id}.jpg`,
        status: 'SUCCESS',
        created_at: r.created_at
      };
    });

    return res.json({
      success: true,
      databaseName: dbName,
      tableName: 'ocr_results',
      columns,
      data: formattedData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      availableTables: ['ocr_results', 'images'],
      isDemoMode: false,
      source: 'MYSQL_LIVE'
    });
  } catch (err: any) {
    console.error('MySQL Query Error (falling back to Demo mode):', err.message);
    return res.json({
      success: true,
      databaseName: dbName,
      tableName: 'ocr_results',
      columns: [],
      data: FALLBACK_DEMO_RECORDS,
      pagination: { page: 1, limit, total: FALLBACK_DEMO_RECORDS.length, totalPages: 1 },
      availableTables: ['ocr_results', 'images'],
      isDemoMode: true,
      error: `Không thể kết nối MySQL 14.225.250.17: ${err.message}`,
      source: 'FALLBACK_DEMO'
    });
  }
});



// Global Express Error Handler for Vercel Serverless
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Express Error:', err);
  res.status(200).json({
    success: true,
    databaseName: 'image_ocr',
    tableName: 'ocr_results',
    columns: [],
    data: FALLBACK_DEMO_RECORDS,
    pagination: { page: 1, limit: 70, total: FALLBACK_DEMO_RECORDS.length, totalPages: 1 },
    availableTables: ['ocr_results', 'images'],
    isDemoMode: true,
    error: String(err?.message || err),
    source: 'FALLBACK_DEMO'
  });
});

export default app;
