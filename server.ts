import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database configuration targeting 14.225.250.17
const getDbConfig = () => ({
  host: process.env.DB_HOSTNAME || '14.225.250.17',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'upos',
  password: process.env.DB_PASSWORD || '67bDuyyve4@#*rawvYpNOJaW',
  database: 'image_ocr', // ALWAYS default to image_ocr unless overridden by query parameter
  connectTimeout: 8000,
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

// Check Database Connection Status
app.get('/api/db-status', async (req, res) => {
  const config = getDbConfig();
  const startTime = Date.now();
  const requestedDb = (req.query.db as string) || 'image_ocr';

  try {
    const pool = getPoolForDb(requestedDb);
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT 1 as connected, DATABASE() as current_db');
    const pingTime = Date.now() - startTime;

    // Fetch tables list
    const [tables] = await pool.query<mysql.RowDataPacket[]>('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0] as string);

    // Get total rows in main table if available
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
      isDemoMode: false,
      message: `Lỗi kết nối CSDL: ${err.message}`
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
    res.json({ success: false, databases: ['image_ocr', 'upos'], error: err.message });
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
    res.json({ success: false, database: dbName, tables: [], error: err.message });
  }
});

// Fetch OCR Data (From Live MySQL)
app.get('/api/ocr-data', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const search = ((req.query.search as string) || '').trim();
  const dbName = (req.query.db as string) || 'image_ocr';
  const tableName = (req.query.tableName as string) || 'ocr_results';
  const modelFilter = (req.query.model as string) || '';

  try {
    const pool = getPoolForDb(dbName);

    // If querying image_ocr.ocr_results (The main benchmark OCR table)
    if (dbName === 'image_ocr' && (tableName === 'ocr_results' || tableName === 'image_ocr')) {
      let whereConditions: string[] = [];
      let queryParams: any[] = [];

      if (search) {
        whereConditions.push('(o.name LIKE ? OR o.phone LIKE ? OR o.address LIKE ? OR o.products LIKE ? OR o.raw_text LIKE ? OR o.model_used LIKE ?)');
        const s = `%${search}%`;
        queryParams.push(s, s, s, s, s, s);
      }

      if (modelFilter) {
        whereConditions.push('o.model_used = ?');
        queryParams.push(modelFilter);
      }

      const whereClause = whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '';

      // Count total rows
      const [countRows] = await pool.query<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM ocr_results o${whereClause}`,
        queryParams
      );
      const total = countRows[0]?.total || 0;

      // Query with image_base64 joined - order by model_used first, then id DESC
      const offset = (page - 1) * limit;
      const selectSql = `
        SELECT o.*, i.image_base64 
        FROM ocr_results o 
        LEFT JOIN images i ON o.image_id = i.id
        ${whereClause} 
        ORDER BY o.model_used ASC, o.id DESC 
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.query<mysql.RowDataPacket[]>(
        selectSql,
        [...queryParams, limit, offset]
      );

      // Columns definition
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

      // Format data
      const formattedData = rows.map(r => {
        let imageUrl = null;
        if (r.image_base64) {
          const b64 = r.image_base64.toString().trim();
          imageUrl = b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`;
        }

        return {
          id: r.id,
          image_id: r.image_id,
          image_url: imageUrl,
          image_base64: r.image_base64,
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
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        },
        availableTables: ['ocr_results', 'images'],
        isDemoMode: false,
        source: 'MYSQL_LIVE'
      });
    }

    // Generic Table Query for other tables/databases
    const [tables] = await pool.query<mysql.RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0] as string);
    const targetTable = tableNames.find(t => t.toLowerCase() === tableName.toLowerCase()) || tableNames[0];

    if (!targetTable) {
      return res.json({
        success: false,
        error: `Không tìm thấy bảng ${tableName} trong database ${dbName}`,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
      });
    }

    // Inspect columns
    const [cols] = await pool.query<mysql.RowDataPacket[]>(`DESCRIBE \`${targetTable}\``);
    const colList = cols.map(c => ({
      field: c.Field as string,
      type: c.Type as string,
      key: c.Key as string,
      null: c.Null as string
    }));

    // Count
    const [countResult] = await pool.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) as total FROM \`${targetTable}\``);
    const total = countResult[0]?.total || 0;

    // Fetch
    const offset = (page - 1) * limit;
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT * FROM \`${targetTable}\` LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      databaseName: dbName,
      tableName: targetTable,
      columns: colList,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      },
      availableTables: tableNames,
      isDemoMode: false,
      source: 'MYSQL_LIVE'
    });

  } catch (err: any) {
    console.error('API Error:', err.message);
    res.status(500).json({
      success: false,
      error: `Lỗi truy vấn CSDL: ${err.message}`,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      isDemoMode: false
    });
  }
});

// App initialization
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server OCR Dashboard running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
