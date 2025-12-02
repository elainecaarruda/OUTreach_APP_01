import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { google } from 'googleapis';
import multer from 'multer';
import { Readable } from 'stream';
import db from './db.js';
import { generateTestimonyWord, bufferToStream } from './wordGenerator.js';

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:3000',
    /\.replit\.dev$/,
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// --- Google Drive Integration ---

let connectionSettings = null;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  try {
    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

    if (!connectionSettings || !accessToken) {
      throw new Error('Google Drive not connected');
    }
    return accessToken;
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    throw error;
  }
}

async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

// --- Google Drive Endpoints ---

app.post('/api/drive/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const drive = await getGoogleDriveClient();
    const { parentId, description } = req.body;

    const fileMetadata = {
      name: req.file.originalname,
      description: description || 'Testimony Media',
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    // Convert buffer to stream
    const bufferStream = Readable.from(req.file.buffer);

    const media = {
      mimeType: req.file.mimetype,
      body: bufferStream,
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, mimeType, createdTime',
    });

    console.log('✅ File uploaded to Google Drive:', file.data.id);
    res.json({
      success: true,
      fileId: file.data.id,
      fileName: file.data.name,
      webViewLink: file.data.webViewLink,
      mimeType: file.data.mimeType,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/drive/list', async (req, res) => {
  try {
    const drive = await getGoogleDriveClient();
    const { folderId } = req.query;

    let query = "trashed = false";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const files = await drive.files.list({
      q: query,
      pageSize: 50,
      fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime)',
    });

    res.json({
      success: true,
      files: files.data.files || [],
    });
  } catch (error) {
    console.error('❌ List error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/drive/delete/:fileId', async (req, res) => {
  try {
    const drive = await getGoogleDriveClient();
    const { fileId } = req.params;

    await drive.files.delete({
      fileId: fileId,
    });

    console.log('✅ File deleted from Google Drive:', fileId);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drive/create-folder', async (req, res) => {
  try {
    const drive = await getGoogleDriveClient();
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Folder name required' });
    }

    const fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name',
    });

    console.log('✅ Folder created in Google Drive:', folder.data.id);
    res.json({
      success: true,
      folderId: folder.data.id,
      folderName: folder.data.name,
    });
  } catch (error) {
    console.error('❌ Create folder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- OpenAI Endpoints ---

// --- Database Endpoints ---

app.get('/api/evangelismos', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM evangelismos';
    
    if (status) {
      query += ` WHERE status = ?`;
    }
    
    query += ' ORDER BY evangelismoDate DESC';
    
    const stmt = db.prepare(query);
    const evangelismos = status ? stmt.all(status) : stmt.all();
    
    res.json({ success: true, evangelismos });
  } catch (error) {
    console.error('❌ Error fetching evangelismos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evangelismos', async (req, res) => {
  try {
    const { title, evangelismoDate, evangelismoTimeStart, evangelismoTimeEnd, location, leadersNeeded, evangelists, description, additionalNotes } = req.body;

    if (!title || !evangelismoDate || !location) {
      return res.status(400).json({ error: 'Título, data e localização são obrigatórios' });
    }

    const drive = await getGoogleDriveClient();
    
    // Create folder in Google Drive: "{Título} | {Data}"
    const folderName = `${title} | ${evangelismoDate}`;
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name',
    });

    const driveFolderId = folder.data.id;
    console.log('✅ Evangelismo folder created:', driveFolderId);

    // Save to database with status = 'aberto'
    const stmt = db.prepare(`
      INSERT INTO evangelismos (title, evangelismoDate, evangelismoTimeStart, evangelismoTimeEnd, location, status, leadersNeeded, evangelists, description, additionalNotes, driveFolderId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      evangelismoDate,
      evangelismoTimeStart || null,
      evangelismoTimeEnd || null,
      location,
      'aberto',
      leadersNeeded || 1,
      evangelists || 3,
      description || '',
      additionalNotes || '',
      driveFolderId
    );

    res.json({
      success: true,
      evangelismoId: result.lastInsertRowid,
      driveFolderId,
      message: 'Evangelismo criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Error creating evangelismo:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Update evangelismo
app.patch('/api/evangelismos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, evangelismoDate, evangelismoTimeStart, evangelismoTimeEnd, location, description } = req.body;

    if (!title || !evangelismoDate || !location) {
      return res.status(400).json({ error: 'Título, data e localização são obrigatórios' });
    }

    const stmt = db.prepare(`
      UPDATE evangelismos 
      SET title = ?, evangelismoDate = ?, evangelismoTimeStart = ?, evangelismoTimeEnd = ?, location = ?, description = ?
      WHERE id = ?
    `);

    stmt.run(title, evangelismoDate, evangelismoTimeStart || null, evangelismoTimeEnd || null, location, description || '', id);

    res.json({ success: true, message: 'Evangelismo atualizado com sucesso' });
  } catch (error) {
    console.error('❌ Error updating evangelismo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE evangelismo
app.delete('/api/evangelismos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get evangelismo from database to get drive folder ID
    const evangelismo = db.prepare('SELECT * FROM evangelismos WHERE id = ?').get(id);
    if (!evangelismo) {
      return res.status(404).json({ error: 'Evangelismo não encontrado' });
    }

    // Delete from Google Drive
    try {
      const drive = await getGoogleDriveClient();
      await drive.files.delete({ fileId: evangelismo.driveFolderId });
      console.log('✅ Folder deleted from Google Drive:', evangelismo.driveFolderId);
    } catch (driveError) {
      console.warn('⚠️ Aviso ao deletar pasta do Drive:', driveError);
      // Continue even if Drive deletion fails
    }

    // Delete from database
    db.prepare('DELETE FROM testemunhos WHERE evangelismoId = ?').run(id);
    db.prepare('DELETE FROM evangelismos WHERE id = ?').run(id);

    res.json({ success: true, message: 'Evangelismo deletado com sucesso' });
  } catch (error) {
    console.error('❌ Error deleting evangelismo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/testemunhos', async (req, res) => {
  try {
    const {
      evangelismoId,
      title,
      date,
      personalInfo,
      profileInfo,
      eventInfo,
      decisionInfo,
      summaryText,
      summaryNative,
      summaryEnglish,
      nativeLanguage,
      photosUrls,
      videosUrls
    } = req.body;

    if (!evangelismoId || !title) {
      return res.status(400).json({ error: 'Evangelismo ID e título são obrigatórios' });
    }

    // Get evangelismo from database
    const evangelismo = db.prepare('SELECT * FROM evangelismos WHERE id = ?').get(evangelismoId);
    if (!evangelismo) {
      return res.status(404).json({ error: 'Evangelismo não encontrado' });
    }

    const drive = await getGoogleDriveClient();

    // Create main testemunho folder inside evangelismo folder: "{title} | {date}"
    const testimonyDate = date || new Date().toISOString().split('T')[0];
    const testimonyFolderName = `${title} | ${testimonyDate}`;
    const mainFolderMetadata = {
      name: testimonyFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [evangelismo.driveFolderId],
    };

    const mainFolder = await drive.files.create({
      resource: mainFolderMetadata,
      fields: 'id, name',
    });

    const driveFolderId = mainFolder.data.id;

    // Create subfolders: Photos and Videos directly in testimony folder
    const photosFolder = await drive.files.create({
      resource: {
        name: 'Photos',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [driveFolderId],
      },
      fields: 'id',
    });

    const videosFolder = await drive.files.create({
      resource: {
        name: 'Videos',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [driveFolderId],
      },
      fields: 'id',
    });

    // Generate native language Word document
    const summaryToUse = summaryNative || summaryText;
    const wordBufferNative = await generateTestimonyWord({
      title,
      personalInfo,
      profileInfo,
      eventInfo,
      decisionInfo,
      summaryText: summaryToUse,
      evangelismoTitle: evangelismo.title,
      evangelismoDate: evangelismo.evangelismoDate
    });

    // Upload native Word to Drive
    const wordStreamNative = bufferToStream(wordBufferNative);
    const wordFileNative = await drive.files.create({
      resource: {
        name: `${title}.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        parents: [driveFolderId],
      },
      media: {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        body: wordStreamNative,
      },
      fields: 'id, name, webViewLink',
    });

    let wordFileEnglish = null;
    
    // Generate English Word document if bilingual summaries provided
    if (summaryEnglish) {
      const wordBufferEnglish = await generateTestimonyWord({
        title: `${title} (English)`,
        personalInfo,
        profileInfo,
        eventInfo,
        decisionInfo,
        summaryText: summaryEnglish,
        evangelismoTitle: evangelismo.title,
        evangelismoDate: evangelismo.evangelismoDate
      });

      const wordStreamEnglish = bufferToStream(wordBufferEnglish);
      wordFileEnglish = await drive.files.create({
        resource: {
          name: `${title} (English).docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          parents: [driveFolderId],
        },
        media: {
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          body: wordStreamEnglish,
        },
        fields: 'id, name, webViewLink',
      });
    }

    console.log('✅ Testemunho folder structure created:', driveFolderId);

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO testemunhos (
        evangelismoId, title, personalInfo, profileInfo, eventInfo, decisionInfo,
        summaryText, photosUrls, videosUrls, driveFolderId, resumoDocxId,
        videosFolderId, photosFolderId, summaryNative, summaryEnglish, nativeLanguage, resumoEnglishDocxId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      evangelismoId, title, personalInfo || '', profileInfo || '', eventInfo || '',
      decisionInfo || '', summaryText || '', photosUrls || '', videosUrls || '',
      driveFolderId, wordFileNative.data.id, videosFolder.data.id,
      photosFolder.data.id, summaryNative || '', summaryEnglish || '', nativeLanguage || 'pt-BR',
      wordFileEnglish ? wordFileEnglish.data.id : null
    );

    res.json({
      success: true,
      testemunhoId: result.lastInsertRowid,
      driveFolderId,
      videosFolderId: videosFolder.data.id,
      photosFolderId: photosFolder.data.id,
      resumoDocxUrl: wordFileNative.data.webViewLink,
      resumoEnglishDocxUrl: wordFileEnglish ? wordFileEnglish.data.webViewLink : null,
      message: 'Testemunho criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Error creating testemunho:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload-media', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { testemunhoId, mediaType } = req.body;

    if (!testemunhoId) {
      return res.status(400).json({ error: 'Testemunho ID é obrigatório' });
    }

    // Get testemunho from database
    const testemunho = db.prepare('SELECT * FROM testemunhos WHERE id = ?').get(testemunhoId);
    if (!testemunho) {
      return res.status(404).json({ error: 'Testemunho não encontrado' });
    }

    const drive = await getGoogleDriveClient();

    // Determine target folder
    let targetFolderId;
    if (mediaType === 'photo') {
      targetFolderId = testemunho.photosFolderId;
    } else if (mediaType === 'video') {
      targetFolderId = testemunho.videosFolderId;
    } else {
      return res.status(400).json({ error: 'Media type deve ser "photo" ou "video"' });
    }

    // Upload file to Google Drive
    const bufferStream = Readable.from(req.file.buffer);
    const fileMetadata = {
      name: req.file.originalname,
      parents: [targetFolderId],
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
      fields: 'id, name, webViewLink, mimeType',
    });

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO uploaded_files (testemunhoId, fileId, fileName, fileType, driveLink)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(testemunhoId, file.data.id, file.data.name, mediaType, file.data.webViewLink);

    console.log('✅ File uploaded to Google Drive:', file.data.id);

    res.json({
      success: true,
      fileId: file.data.id,
      fileName: file.data.name,
      webViewLink: file.data.webViewLink,
      mimeType: file.data.mimeType,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/improve-testimony', async (req, res) => {
  try {
    const { text, isStructured } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto não fornecido' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return res.status(500).json({ error: 'API key não configurada' });
    }

    console.log('📝 Processando texto de', text.length, 'caracteres...');

    let prompt = text;
    
    if (!isStructured) {
      prompt = `Você é uma assistante especialista em organizar relatos e testemunhos.
Recebi o seguinte texto ditado pelo usuário, que pode conter erros de gramática, pontuação ou frases desconexas:

"${text}"

Sua tarefa é:
1. Corrigir ortografia e gramática.
2. Reescrever o texto de forma clara, concisa e coerente.
3. Manter a essência do relato, preservando o contexto emocional e espiritual.
4. Deixar o texto pronto para registro ou compartilhamento em mídia, newsletter ou relatório interno.
5. Entregar apenas o texto final polido, sem explicações adicionais.

Texto final polido:`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI API Error:', error);
      return res.status(response.status).json({ error: error.error?.message || 'Erro na API OpenAI' });
    }

    const data = await response.json();
    const improvedText = data.choices[0]?.message?.content?.trim() || text;

    console.log('✅ Texto melhorado com sucesso');
    res.json({ improvedText });
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// --- Generate Full Testimony Narrative ---
app.post('/api/gerarTestemunho', async (req, res) => {
  try {
    const { data, nome, nacionalidade, decisao, historia } = req.body;

    if (!nome || !decisao || !historia) {
      return res.status(400).json({ error: 'Nome, Decisão e História são obrigatórios' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return res.status(500).json({ error: 'API key não configurada' });
    }

    console.log('✨ Gerando testemunho narrativo estruturado...');

    const prompt = `Atue como um revisor experiente e analise o seguinte texto. Verifique e corrija quaisquer erros de ortografia, gramática, pontuação e concordância. Além disso, revise o texto para garantir clareza, concisão e uma estrutura lógica, eliminando palavras e frases desnecessárias. Sugira melhorias para tornar a linguagem mais eficaz e o texto mais envolvente.

Sua tarefa FINAL é gerar um testemunho cristão completo, estruturado, com:

1. **TÍTULO**: Um título inspirador e breve (máx 10 palavras) para o testemunho
2. **NARRATIVA**: Um parágrafo único, fluido, coerente, gramaticalmente perfeito e JUSTIFICADO que segua este fluxo:
   - Introdução (apresentação breve da pessoa)
   - Situação antes (contexto, desafios e dificuldades)
   - O encontro / conversa (como e quando aconteceu o encontro espiritual)
   - Momento da decisão (o que levou à decisão transformadora)
   - Transformação (mudança vivida após o encontro)
   - Agradecimento a Deus (conclusão espiritual e esperança)

INSTRUÇÕES CRÍTICAS:
- Revise RIGOROSAMENTE ortografia, gramática, pontuação e concordância
- Elimine palavras e frases desnecessárias para máxima clareza
- Garanta estrutura lógica fluida e natural
- Linguagem envolvente, respeitosa e autêntica
- Apenas UM parágrafo bem estruturado, pronto para publicação
- TEXTO COMPLETAMENTE JUSTIFICADO

Informações para gerar o testemunho:
- Data: ${data || 'Não informada'}
- Nome/Pessoa: ${nome}
- Nacionalidade: ${nacionalidade || 'Não informada'}
- Decisão(es): ${decisao}
- História/Contexto: ${historia}

Responda com este FORMATO EXATO (sem markdown, sem formatação adicional):

TÍTULO: [seu título aqui]
NARRATIVA: [seu parágrafo narrativo aqui, começando direto, completamente justificado]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI API Error:', error);
      return res.status(response.status).json({ error: error.error?.message || 'Erro na API OpenAI' });
    }

    const responseData = await response.json();
    const fullResponse = responseData.choices[0]?.message?.content?.trim() || '';

    // Parse the response to extract title and narrative
    const titleMatch = fullResponse.match(/TÍTULO:\s*(.+?)(?=\nNARRATIVA:|$)/s);
    const narrativeMatch = fullResponse.match(/NARRATIVA:\s*(.+?)$/s);

    const titulo = titleMatch ? titleMatch[1].trim() : 'Testemunho';
    const narrativa = narrativeMatch ? narrativeMatch[1].trim() : fullResponse;

    console.log('✅ Testemunho gerado com sucesso');
    res.json({ 
      success: true,
      titulo: titulo,
      narrativa: narrativa,
      data: data || new Date().toISOString().split('T')[0],
      nome: nome,
      nacionalidade: nacionalidade || 'Não informada',
      decisao: decisao
    });
  } catch (error) {
    console.error('❌ Erro ao gerar testemunho:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// --- SISTEMA DE APLICAÇÕES (Evangelismo Management) ---

// GET /evangelismos/:id - Details with aplicacoes
app.get('/api/evangelismos/:id', async (req, res) => {
  try {
    const evangelismo = db.prepare('SELECT * FROM evangelismos WHERE id = ?').get(req.params.id);
    if (!evangelismo) return res.status(404).json({ error: 'Evangelismo não encontrado' });
    
    const aplicacoes = db.prepare('SELECT * FROM aplicacoes WHERE evangelismoId = ?').all(req.params.id);
    res.json({ success: true, evangelismo, aplicacoes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /evangelismos/:id/apply - Apply for evangelismo
app.post('/api/evangelismos/:id/apply', async (req, res) => {
  try {
    const { tipo } = req.body;
    const userId = req.header('x-user-id') || `user-${Date.now()}`;
    const userName = req.header('x-user-name') || 'Anônimo';
    
    if (!['evangelista', 'intercessor', 'lider'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const evangelismo = db.prepare('SELECT * FROM evangelismos WHERE id = ?').get(req.params.id);
    if (!evangelismo) return res.status(404).json({ error: 'Evangelismo não encontrado' });

    const stmt = db.prepare(`
      INSERT INTO aplicacoes (evangelismoId, userId, userName, tipo, status)
      VALUES (?, ?, ?, ?, 'pendente')
    `);
    
    const result = stmt.run(req.params.id, userId, userName, tipo);
    res.status(201).json({ success: true, aplicacaoId: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/evangelismos/:id/aplicacoes - List applications for admin/lider
app.get('/api/admin/evangelismos/:id/aplicacoes', async (req, res) => {
  try {
    const aplicacoes = db.prepare('SELECT * FROM aplicacoes WHERE evangelismoId = ?').all(req.params.id);
    res.json({ success: true, aplicacoes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /admin/aplicacoes/:id - Approve/Reject application
app.patch('/api/admin/aplicacoes/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pendente', 'aprovado', 'recusado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const stmt = db.prepare('UPDATE aplicacoes SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, req.params.id);
    
    res.json({ success: true, message: `Aplicação ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /admin/evangelismos/:id/materiais - Set required materials
app.patch('/api/admin/evangelismos/:id/materiais', async (req, res) => {
  try {
    const { materiais } = req.body;
    const materiaisStr = JSON.stringify(materiais || []);
    
    const stmt = db.prepare('UPDATE evangelismos SET materials = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(materiaisStr, req.params.id);
    
    res.json({ success: true, materiais });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /lider/evangelismos/:id/materiais - Leader marks materials
app.patch('/api/lider/evangelismos/:id/materiais', async (req, res) => {
  try {
    const { materiais } = req.body;
    const userId = req.header('x-user-id') || 'lider-anon';
    
    const evangelismo = db.prepare('SELECT * FROM evangelismos WHERE id = ?').get(req.params.id);
    if (!evangelismo) return res.status(404).json({ error: 'Evangelismo não encontrado' });
    
    res.json({ success: true, message: 'Materiais marcados', userId, materiais });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
