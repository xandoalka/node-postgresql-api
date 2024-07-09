const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bucket = require('../firebaseConfig.js');
const uniqid = require('uniqid');

const uploadImageToFirebase = (file) => {
   return new Promise((resolve, reject) => {
      // Generate a unique ID for the filename
      const uniqueName = uniqid() + (file.mimetype === 'image/jpeg' ? '.jpg' : '.png');
      const blob = bucket.file(uniqueName);
      const blobStream = blob.createWriteStream({
         metadata: {
            contentType: file.mimetype
         }
      });

      blobStream.on('error', (err) => reject(err));

      blobStream.on('finish', async () => {
         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
         resolve(publicUrl);
      });

      blobStream.end(file.buffer);
   });
};

const deleteImageFromFirebase = (fileUrl) => {
   return new Promise((resolve, reject) => {
      const fileName = fileUrl.split('/').pop();
      const file = bucket.file(fileName);

      file.delete((err) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
};

// Get all items
exports.getAllItems = async (req, res) => {
   try {
      const apps = await prisma.app.findMany();
      res.status(200).json(apps);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
   const { id } = req.params;
   try {
      const app = await prisma.app.findUnique({
         where: { id: parseInt(id) }
      });
      if (!app) {
         return res.status(404).json({ error: 'App not found' });
      }
      res.status(200).json(app);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

// Create a new item
exports.createItem = async (req, res) => {
   const { title, description, developer } = req.body;
   try {
      const logoUrl = req.files.logo ? await uploadImageToFirebase(req.files.logo[0]) : null;
      const imageUrl = req.files.image ? await uploadImageToFirebase(req.files.image[0]) : null;

      const newApp = await prisma.app.create({
         data: { title, description, developer, logo: logoUrl, image: imageUrl }
      });
      res.status(201).json(newApp);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

// Patch an existing item (partial update)
exports.patchItem = async (req, res) => {
   const { id } = req.params;
   try {
      const app = await prisma.app.findUnique({
         where: { id: parseInt(id) }
      });

      if (!app) {
         return res.status(404).json({ error: 'App not found' });
      }

      const logoUrl = req.files.logo ? await uploadImageToFirebase(req.files.logo[0]) : null;
      const imageUrl = req.files.image ? await uploadImageToFirebase(req.files.image[0]) : null;

      // Hapus foto lama jika ada foto baru yang di-upload
      if (logoUrl && app.logo) {
         await deleteImageFromFirebase(app.logo);
      }
      if (imageUrl && app.image) {
         await deleteImageFromFirebase(app.image);
      }

      const data = { ...req.body };
      if (logoUrl) data.logo = logoUrl;
      if (imageUrl) data.image = imageUrl;

      const updatedApp = await prisma.app.update({
         where: { id: parseInt(id) },
         data: data
      });
      res.status(200).json(updatedApp);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

// Delete an item
exports.deleteItem = async (req, res) => {
   const { id } = req.params;
   try {
      const app = await prisma.app.findUnique({
         where: { id: parseInt(id) }
      });

      if (!app) {
         return res.status(404).json({ error: 'App not found' });
      }

      // Hapus foto dari Firebase Storage
      if (app.logo) {
         await deleteImageFromFirebase(app.logo);
      }
      if (app.image) {
         await deleteImageFromFirebase(app.image);
      }

      await prisma.app.delete({
         where: { id: parseInt(id) }
      });
      res.status(200).json({ message: 'App deleted successfully' });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};
