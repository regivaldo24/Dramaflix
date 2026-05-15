import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Preference, Payment, PreApproval, PaymentRefund } from 'mercadopago';
import dotenv from 'dotenv';
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple JSON Database Initialization
const DB_PATH = path.join(process.cwd(), 'db.json');
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ 
    users: [], 
    payments: [], 
    bannedLogs: [], 
    ads_history: [],
    chat_sessions: [],
    chat_messages: [] 
  }, null, 2));
} else {
  // Ensure tables exist in existing db
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  let changed = false;
  if (!db.ads_history) { db.ads_history = []; changed = true; }
  if (!db.chat_sessions) { db.chat_sessions = []; changed = true; }
  if (!db.chat_messages) { db.chat_messages = []; changed = true; }
  if (!db.short_likes) { db.short_likes = []; changed = true; }
  if (!db.short_comments) { db.short_comments = []; changed = true; }
  if (!db.short_favorites) { db.short_favorites = []; changed = true; }
  if (changed) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }
}

// In-memory rate limiting for comments
const commentRateLimit = new Map<string, number>();

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const PRIVATE_STORAGE_DIR = path.join(process.cwd(), 'storage_private');
if (!fs.existsSync(PRIVATE_STORAGE_DIR)) {
  fs.mkdirSync(PRIVATE_STORAGE_DIR, { recursive: true });
}

const getDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Multer Memory Storage for processing with sharp
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Erro: Arquivo deve ser uma imagem (jpeg, jpg, png, webp)!"));
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());
  app.use(cors());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Socket.io for Customer Support Chat
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("start_support", (data) => {
      const { userId, userName } = data;
      const db = getDB();
      
      // Close any active session for this user first
      db.chat_sessions = db.chat_sessions.map((s: any) => 
        s.user_id === userId && s.status === 'active' ? { ...s, status: 'closed' } : s
      );

      const sessionId = crypto.randomUUID();
      const newSession = {
        id: sessionId,
        user_id: userId,
        user_name: userName,
        status: 'active',
        created_at: new Date().toISOString()
      };
      
      db.chat_sessions.push(newSession);
      saveDB(db);

      socket.join(sessionId);
      
      // Notify admins
      io.emit("admin_notification", {
        type: "new_chat",
        sessionId,
        userName,
        userId
      });

      socket.emit("session_started", { sessionId });
    });

    socket.on("send_message", (data) => {
      const { sessionId, userId, userName, message, isAdmin } = data;
      const db = getDB();
      
      const session = db.chat_sessions.find((s: any) => s.id === sessionId && s.status === 'active');
      if (session) {
        const newMessage = {
          id: crypto.randomUUID(),
          session_id: sessionId,
          user_id: userId,
          user_name: userName,
          message,
          is_admin: isAdmin || false,
          created_at: new Date().toISOString()
        };
        
        db.chat_messages.push(newMessage);
        saveDB(db);
        
        io.to(sessionId).emit("receive_message", newMessage);
      }
    });

    socket.on("end_support", (data) => {
      const { sessionId } = data;
      const db = getDB();
      const sessionIndex = db.chat_sessions.findIndex((s: any) => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        db.chat_sessions[sessionIndex].status = 'closed';
        db.chat_sessions[sessionIndex].closed_at = new Date().toISOString();
        saveDB(db);
        
        io.to(sessionId).emit("support_ended", { sessionId });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
  
  // NOTE: Static 'uploads' is REMOVED or restricted for security. 
  // We serve avatars via a controlled proxy route below.

  // API Routes
  
  // SECURE AVATAR SERVING (Proxy Route)
  app.get("/api/avatar/:userId", (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    const user = db.users.find((u: any) => u.id === userId);
    
    if (!user || !user.foto) {
      // Return default avatar if not set
      return res.redirect("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200");
    }

    const filePath = path.join(PRIVATE_STORAGE_DIR, user.foto);
    
    // Prevent directory traversal and check existence
    if (fs.existsSync(filePath) && filePath.startsWith(PRIVATE_STORAGE_DIR)) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1h
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).json({ error: "Imagem não encontrada" });
    }
  });

  // REAL AUTH ENDPOINTS
  app.post("/api/register", async (req, res) => {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const db = getDB();
    if (db.users.some((u: any) => u.email === email)) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: crypto.randomUUID(),
        username,
        email,
        phone,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        banido: 0,
        tipo: 'gratuito',
        moedas: 0,
        bonus: 0,
        ads_watched_today: 0,
        last_ad_date: new Date().toISOString().split('T')[0]
      };

      db.users.push(newUser);
      saveDB(db);

      res.json({ success: true, message: "Conta criada com sucesso!", user: { id: newUser.id, username: newUser.username, email: newUser.email } });
    } catch (err) {
      res.status(500).json({ error: "Erro ao cadastrar." });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const db = getDB();
    const user = db.users.find((u: any) => u.email === email);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (user.banido === 1) {
      return res.status(403).json({ error: "Sua conta foi banida." });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // In a real production app, we would use JWT or express-session here.
        // For this app, we return the user data to be managed in AuthContext.
        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            tipo: user.tipo,
            foto: user.foto ? `/api/avatar/${user.id}` : null
          } 
        });
      } else {
        res.status(401).json({ error: "Senha incorreta." });
      }
    } catch (err) {
      res.status(500).json({ error: "Erro ao autenticar." });
    }
  });

  app.post("/api/upload-profile-photo", upload.single('foto'), async (req, res) => {
    const { userId } = req.body;
    if (!req.file || !userId) {
      return res.status(400).json({ error: "Arquivo ou ID de usuário ausente" });
    }

    try {
      // Security Check: Verify it's actually an image and clean it
      const sharpInstance = sharp(req.file.buffer);
      const metadata = await sharpInstance.metadata();
      
      if (!metadata.format) {
        throw new Error("Arquivo inválido!");
      }

      // Secure Filename Generation (UUID-like hex)
      const secureName = crypto.randomBytes(32).toString('hex') + ".jpg";
      const filePath = path.join(PRIVATE_STORAGE_DIR, secureName);

      // REPROCESS: Standardize to JPEG, Resize, Strip Metada (implicit in toFile)
      await sharpInstance
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(filePath);

      const db = getDB();
      const userIndex = db.users.findIndex((u: any) => u.id === userId);
      
      if (userIndex !== -1) {
        // Clean up old file if it exists
        const oldFilename = db.users[userIndex].foto;
        if (oldFilename) {
           const oldPath = path.join(PRIVATE_STORAGE_DIR, oldFilename);
           if (fs.existsSync(oldPath)) {
             try { fs.unlinkSync(oldPath); } catch (e) {}
           }
        }

        // Store ONLY the filename in DB, not the full path
        db.users[userIndex].foto = secureName;
        saveDB(db);
        
        // Return the proxy URL
        res.json({ success: true, foto: `/api/avatar/${userId}?t=${Date.now()}` });
      } else {
        res.status(404).json({ error: "Usuário não encontrado" });
      }
    } catch (error: any) {
      console.error("Erro no processamento da imagem:", error);
      res.status(500).json({ error: error.message || "Erro ao processar imagem" });
    }
  });
  app.get("/api/admin/users", (req, res) => {
    const db = getDB();
    const usersWithUrls = db.users.map((u: any) => ({
      ...u,
      foto: u.foto ? `/api/avatar/${u.id}` : null
    }));
    res.json(usersWithUrls);
  });

  app.post("/api/admin/ban", (req, res) => {
    const { userId, ban } = req.body;
    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].banido = ban ? 1 : 0;
      saveDB(db);
      res.json({ success: true, user: db.users[userIndex] });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/admin/payments", (req, res) => {
    const db = getDB();
    res.json(db.payments);
  });

  app.get("/api/admin/notifications", (req, res) => {
    const db = getDB();
    const unread = db.payments.filter((p: any) => !p.read).length;
    res.json({ unread });
  });

  app.post("/api/admin/notifications/read", (req, res) => {
    const db = getDB();
    db.payments = db.payments.map((p: any) => ({ ...p, read: true }));
    saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/create-subscription", async (req, res) => {
    const { plan, userId, email } = req.body;
    
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.warn("MERCADO_PAGO_ACCESS_TOKEN is missing. Returning mock subscription.");
      return res.json({ 
        id: "mock_sub_id", 
        init_point: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id=mock_sub_id",
        isMock: true 
      });
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    const preApproval = new PreApproval(client);

    try {
      const response = await preApproval.create({
        body: {
          reason: `Assinatura VIP ${plan.title}`,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: Number(plan.price.replace(',', '.')),
            currency_id: "BRL"
          },
          back_url: `${process.env.APP_URL}/success`,
          payer_email: email,
          status: "pending",
          external_reference: userId
        }
      });

      res.json({ id: response.id, init_point: response.init_point });
    } catch (error) {
      console.error("Mercado Pago Subscription Error:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  app.post("/api/create-preference", async (req, res) => {
    const { plan, userId, email } = req.body;
    
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      // For demo purposes, we'll return a mock preference ID if token is missing
      // But we should warn the user.
      console.warn("MERCADO_PAGO_ACCESS_TOKEN is missing. Returning mock preference.");
      return res.json({ 
        id: "mock_pref_id", 
        init_point: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_pref_id",
        isMock: true 
      });
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    const preference = new Preference(client);

    try {
      const response = await preference.create({
        body: {
          items: [
            {
              id: plan.id,
              title: `Plano VIP ${plan.title}`,
              unit_price: Number(plan.price.replace(',', '.')),
              quantity: 1,
              currency_id: 'BRL'
            }
          ],
          payer: {
            email: email
          },
          metadata: {
            user_id: userId,
            plan_id: plan.id,
            plan_title: plan.title
          },
          back_urls: {
            success: `${process.env.APP_URL}/success`,
            failure: `${process.env.APP_URL}/failure`,
            pending: `${process.env.APP_URL}/pending`
          },
          auto_return: "approved",
          notification_url: `${process.env.APP_URL}/api/webhook`
        }
      });

      res.json({ id: response.id, init_point: response.init_point });
    } catch (error) {
      console.error("Mercado Pago Error:", error);
      res.status(500).json({ error: "Failed to create preference" });
    }
  });

  app.post("/api/create-coin-preference", async (req, res) => {
    const { packageId, userId, email, coins, price } = req.body;
    
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.warn("MERCADO_PAGO_ACCESS_TOKEN is missing. Returning mock coin preference.");
      return res.json({ 
        id: "mock_coin_pref", 
        init_point: "https://www.mercadopago.com.br/checkout/mock",
        isMock: true 
      });
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    const preference = new Preference(client);

    try {
      const response = await preference.create({
        body: {
          items: [
            {
              id: packageId,
              title: `Pacote de Moedas: ${coins}`,
              quantity: 1,
              unit_price: Number(price.replace('R$', '').replace(',', '.')),
              currency_id: 'BRL'
            }
          ],
          payer: {
            email: email
          },
          metadata: {
            user_id: userId,
            type: 'coins',
            amount: coins
          },
          back_urls: {
            success: `${process.env.APP_URL}/success`,
            failure: `${process.env.APP_URL}/failure`
          },
          auto_return: "approved",
          notification_url: `${process.env.APP_URL}/api/webhook`
        }
      });

      res.json({ id: response.id, init_point: response.init_point });
    } catch (error) {
      console.error("Mercado Pago Coin Error:", error);
      res.status(500).json({ error: "Failed to create coin preference" });
    }
  });

  app.post("/api/sync-user", (req, res) => {
    const { user } = req.body;
    if (!user) return res.status(400).send("User required");
    
    const db = getDB();
    const index = db.users.findIndex((u: any) => u.id === user.id || u.email === user.email);
    
    if (index === -1) {
      db.users.push({ ...user, created_at: new Date().toISOString(), banido: 0, tipo: 'gratuito' });
    } else {
      // Update existing user without overwriting critical fields like banido or subscription info
      db.users[index] = { ...db.users[index], ...user };
    }
    
    saveDB(db);
    const resultUser = { ...db.users[index === -1 ? db.users.length - 1 : index] };
    if (resultUser.foto) {
      resultUser.foto = `/api/avatar/${resultUser.id}?t=${Date.now()}`;
    }
    res.json(resultUser);
  });

  app.post("/api/watch-ad", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const today = new Date().toISOString().split('T')[0];
    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = db.users[userIndex];

    // Reset diário automático
    if (user.last_ad_date !== today) {
      user.ads_watched_today = 0;
      user.last_ad_date = today;
    }

    // Verificar limite
    if (user.ads_watched_today >= 10) {
      return res.status(400).json({ error: "Limite diário atingido" });
    }

    // 💰 Recompensa
    const reward = 30;

    user.moedas = (user.moedas || 0) + reward;
    user.ads_watched_today = (user.ads_watched_today || 0) + 1;

    // Salvar histórico
    const historyEntry = {
      id: crypto.randomUUID(),
      user_id: userId,
      reward,
      created_at: new Date().toISOString()
    };
    db.ads_history.push(historyEntry);

    saveDB(db);

    res.json({
      success: true,
      coins_added: reward,
      total_coins: user.moedas,
      ads_watched_today: user.ads_watched_today
    });
  });

  app.get("/api/confirm-payment", async (req, res) => {
    const { payment_id } = req.query;
    if (!payment_id) return res.status(400).json({ error: "payment_id required" });

    try {
      if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: payment_id.toString() });

        if (paymentData.status === 'approved') {
          const metadata = paymentData.metadata;
          const db = getDB();
          
          // Save to payments history if not exists
          const existingPayment = db.payments.find((p: any) => p.id === paymentData.id);
          if (!existingPayment) {
            const newPayment = {
              id: paymentData.id,
              user_id: metadata?.user_id,
              email: paymentData.payer?.email || metadata?.email,
              valor: paymentData.transaction_amount,
              status: paymentData.status,
              tipo: metadata?.type === 'coins' ? 'moedas' : 'assinatura',
              detalhes: metadata?.plan_title || metadata?.amount + " moedas",
              criado_em: new Date().toISOString(),
              read: false
            };
            db.payments.push(newPayment);

            if (metadata) {
              const { user_id, plan_id, plan_title, type, amount } = metadata;
              const userIndex = db.users.findIndex((u: any) => u.id === user_id);
              if (userIndex !== -1) {
                if (type === 'coins') {
                  db.users[userIndex].moedas = (db.users[userIndex].moedas || 0) + Number(amount);
                } else {
                  db.users[userIndex].tipo = plan_id || 'vibrante';
                  const exp = new Date();
                  exp.setDate(exp.getDate() + 30);
                  db.users[userIndex].data_expiracao = exp.toISOString();
                }
              }
            }
            saveDB(db);
          }
          return res.json({ success: true, status: 'approved', details: paymentData.metadata });
        }
        return res.json({ success: false, status: paymentData.status });
      } else {
        // Mock success for development if token is missing but it's a mock ID
        if (payment_id.toString().startsWith('mock')) {
          return res.json({ success: true, status: 'approved', isMock: true });
        }
        return res.json({ success: false, error: "MP Token missing" });
      }
    } catch (error) {
      console.error("Confirm Payment Error:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  app.post("/api/webhook", async (req, res) => {
    const { query } = req;
    const topic = (query.topic as string) || (query.type as string);
    const id = (query.id as string) || (req.body && req.body.data && req.body.data.id);

    console.log("Webhook received:", topic, id);

    if (topic === 'payment' && id) {
       try {
         if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
           const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
           const payment = new Payment(client);
           const paymentData = await payment.get({ id: id.toString() });

           if (paymentData.status === 'approved') {
             const metadata = paymentData.metadata;
             const db = getDB();
             
             // Save to payments history
             const newPayment = {
               id: paymentData.id,
               user_id: metadata?.user_id,
               email: paymentData.payer?.email || metadata?.email,
               valor: paymentData.transaction_amount,
               status: paymentData.status,
               tipo: metadata?.type === 'coins' ? 'moedas' : 'assinatura',
               detalhes: metadata?.plan_title || metadata?.amount + " moedas",
               criado_em: new Date().toISOString(),
               read: false
             };
             
             // Prevent duplicates
             if (!db.payments.some((p: any) => p.id === newPayment.id)) {
               db.payments.push(newPayment);
             }

             if (metadata) {
               const { user_id, plan_id, plan_title, type, amount } = metadata;
               
               const userIndex = db.users.findIndex((u: any) => u.id === user_id);
               if (userIndex !== -1) {
                 if (type === 'coins') {
                   console.log(`Payment approved for user ${user_id}: Crediting ${amount} coins`);
                   db.users[userIndex].moedas = (db.users[userIndex].moedas || 0) + Number(amount);
                 } else {
                   console.log(`Payment approved for user ${user_id}, plan ${plan_title}`);
                   db.users[userIndex].tipo = plan_id || 'vibrante'; // default to something if plan_id missing
                   const exp = new Date();
                   exp.setDate(exp.getDate() + 30);
                   db.users[userIndex].data_expiracao = exp.toISOString();
                 }
               }
             }
             saveDB(db);
           }
         }
       } catch (error) {
         console.error("Error processing payment webhook:", error);
       }
    }

    if ((topic === 'preapproval' || topic === 'subscription') && id) {
      try {
        if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
          const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
          const preApproval = new PreApproval(client);
          const subData = await preApproval.get({ id: id.toString() });

          if (subData.status === 'authorized') {
            const email = subData.payer_email;
            const userId = subData.external_reference;
            console.log(`Subscription authorized for user ${userId} (${email})`);
            
            const db = getDB();
            const userIndex = db.users.findIndex((u: any) => u.id === userId || u.email === email);
            if (userIndex !== -1) {
              db.users[userIndex].tipo = 'ouro'; // Map to gold for subscriptions
              db.users[userIndex].mp_subscription_id = subData.id;
              const exp = new Date();
              exp.setDate(exp.getDate() + 30);
              db.users[userIndex].data_expiracao = exp.toISOString();
              saveDB(db);
            }
          } else if (subData.status === 'paused' || subData.status === 'cancelled') {
            console.log(`Subscription ${subData.status} for user ${subData.external_reference}`);
            const db = getDB();
            const userIndex = db.users.findIndex((u: any) => u.id === subData.external_reference);
            if (userIndex !== -1) {
              db.users[userIndex].tipo = 'gratuito';
              db.users[userIndex].mp_subscription_id = null;
              saveDB(db);
            }
          }
        }
      } catch (error) {
        console.error("Error processing subscription webhook:", error);
      }
    }

    res.sendStatus(200);
  });

  app.post("/api/cancel-subscription", async (req, res) => {
    const { subscriptionId } = req.body;
    
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return res.json({ success: true, message: "Mock subscription cancelled" });
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    const preApproval = new PreApproval(client);

    try {
      await preApproval.update({
        id: subscriptionId,
        body: {
          status: "cancelled"
        }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Mercado Pago Cancel Error:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });

  app.post("/api/admin/refund", async (req, res) => {
    const { paymentId } = req.body;
    
    if (!paymentId) return res.status(400).json({ error: "ID do pagamento é obrigatório" });

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return res.json({ success: true, message: "Mock refund processed" });
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    const refund = new PaymentRefund(client);

    try {
      await refund.create({ payment_id: Number(paymentId) });
      
      const db = getDB();
      const paymentIndex = db.payments.findIndex((p: any) => p.id === paymentId || p.id === Number(paymentId));
      if (paymentIndex !== -1) {
        db.payments[paymentIndex].status = 'refunded';
        saveDB(db);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Mercado Pago Refund Error:", error);
      res.status(500).json({ error: "Falha ao processar reembolso no Mercado Pago" });
    }
  });

  app.get("/api/admin/user-payments/:userId", (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    const userPayments = db.payments.filter((p: any) => p.user_id === userId);
    res.json(userPayments);
  });

  // Chat APIs
  app.get("/api/admin/chat-sessions", (req, res) => {
    const db = getDB();
    res.json(db.chat_sessions.filter((s: any) => s.status === 'active'));
  });

  app.get("/api/chat-messages/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const db = getDB();
    const messages = db.chat_messages.filter((m: any) => m.session_id === sessionId);
    res.json(messages);
  });

  // SHORTS API
  app.post("/api/shorts/like", (req, res) => {
    const { userId, shortId } = req.body;
    if (!userId || !shortId) return res.status(400).json({ error: "userId and shortId are required" });

    const db = getDB();
    const index = db.short_likes.findIndex((l: any) => l.user_id === userId && l.short_id === shortId);

    if (index !== -1) {
      db.short_likes.splice(index, 1);
      saveDB(db);
      return res.json({ success: true, result: "unliked" });
    } else {
      db.short_likes.push({ user_id: userId, short_id: shortId, created_at: new Date().toISOString() });
      saveDB(db);
      return res.json({ success: true, result: "liked" });
    }
  });

  app.post("/api/shorts/favorite", (req, res) => {
    const { userId, shortId } = req.body;
    if (!userId || !shortId) return res.status(400).json({ error: "userId and shortId are required" });

    const db = getDB();
    const index = db.short_favorites.findIndex((f: any) => f.user_id === userId && f.short_id === shortId);

    if (index !== -1) {
      db.short_favorites.splice(index, 1);
      saveDB(db);
      return res.json({ success: true, result: "unfavorited" });
    } else {
      db.short_favorites.push({ user_id: userId, short_id: shortId, created_at: new Date().toISOString() });
      saveDB(db);
      return res.json({ success: true, result: "favorited" });
    }
  });

  app.post("/api/shorts/comment", (req, res) => {
    const { userId, shortId, comment, userName } = req.body;
    if (!userId || !shortId || !comment) return res.status(400).json({ error: "userId, shortId and comment are required" });

    // Rate limiting: 1 comment every 10 seconds per user
    const now = Date.now();
    const lastComment = commentRateLimit.get(userId) || 0;
    if (now - lastComment < 10000) {
      return res.status(429).json({ error: "Aguarde um pouco antes de comentar novamente." });
    }
    commentRateLimit.set(userId, now);

    const db = getDB();
    const newComment = {
      id: crypto.randomUUID(),
      user_id: userId,
      user_name: userName || "Usuário",
      short_id: shortId,
      comment: comment.substring(0, 500), // Sanitization: Limit length
      created_at: new Date().toISOString()
    };

    db.short_comments.push(newComment);
    saveDB(db);

    res.json({ success: true, comment: newComment });
  });

  app.get("/api/shorts/data/:shortId", (req, res) => {
    const { shortId } = req.params;
    const { userId } = req.query;
    const db = getDB();

    const id = isNaN(Number(shortId)) ? shortId : Number(shortId);

    const likesCount = db.short_likes.filter((l: any) => String(l.short_id) === String(id)).length;
    const comments = db.short_comments.filter((c: any) => String(c.short_id) === String(id));
    const isLiked = userId ? db.short_likes.some((l: any) => String(l.user_id) === String(userId) && String(l.short_id) === String(id)) : false;
    const isFavorited = userId ? db.short_favorites.some((f: any) => String(f.user_id) === String(userId) && String(f.short_id) === String(id)) : false;

    res.json({
      likesCount,
      commentsCount: comments.length,
      comments: comments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      isLiked,
      isFavorited
    });
  });

  app.get("/api/shorts/favorites/:userId", (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    const favorites = db.short_favorites.filter((f: any) => String(f.user_id) === String(userId));
    res.json(favorites);
  });

  // API Catch-all
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
